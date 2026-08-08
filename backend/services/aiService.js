const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Fallback Natural Language Parser for E-Commerce queries.
 * Used when GEMINI_API_KEY is not configured or API call fails.
 */
function localNLPParse(userQuery, availableCategories = [], availableColors = []) {
    const text = userQuery.toLowerCase().trim();

    let category = null;
    let color = null;
    let minPrice = null;
    let maxPrice = null;
    let sort = null;
    let order = null;

    // Default categories if list is empty
    const knownCategories = availableCategories.length > 0
        ? availableCategories
        : ['men', 'women', 'accessories', 'electronic device', 'mobile', 'sports', 'home', 'cloths'];

    const knownColors = availableColors.length > 0
        ? availableColors
        : ['white', 'black', 'gray', 'blue', 'green', 'red', 'yellow', 'pink', 'purple', 'brown'];

    // 1. Detect Category
    for (const cat of knownCategories) {
        const catLower = cat.toLowerCase();
        if (text.includes(catLower)) {
            category = catLower;
            break;
        }
        // Aliases
        if ((catLower.includes('cloth') || catLower.includes('wear') || catLower.includes('apparel') || catLower.includes('shirt') || catLower.includes('tshirt')) && !category) {
            category = 'cloths';
        } else if ((catLower.includes('mobile') || catLower.includes('phone')) && text.includes('phone')) {
            category = 'mobile';
        } else if ((catLower.includes('electronic') || catLower.includes('gadget') || catLower.includes('headphone') || catLower.includes('laptop')) && !category) {
            category = 'electronic device';
        }
    }

    // 2. Detect Color
    for (const col of knownColors) {
        if (new RegExp(`\\b${col.toLowerCase()}\\b`, 'i').test(text)) {
            color = col.toLowerCase();
            break;
        }
    }

    // 3. Detect Price bounds (e.g., "under 2000", "below 1500", "less than 500", "between 1000 and 3000", "above 500")
    const underMatch = text.match(/(?:under|below|less than|within|upto|up to|budget|max|<=?|\b[<])\s*(?:rs\.?|₹)?\s*(\d+)/i);
    if (underMatch) {
        maxPrice = parseFloat(underMatch[1]);
    }

    const aboveMatch = text.match(/(?:above|over|more than|greater than|min|>=?|\b[>])\s*(?:rs\.?|₹)?\s*(\d+)/i);
    if (aboveMatch) {
        minPrice = parseFloat(aboveMatch[1]);
    }

    const rangeMatch = text.match(/(?:between|from)?\s*(?:rs\.?|₹)?\s*(\d+)\s*(?:to|-|and)\s*(?:rs\.?|₹)?\s*(\d+)/i);
    if (rangeMatch && !underMatch && !aboveMatch) {
        minPrice = parseFloat(rangeMatch[1]);
        maxPrice = parseFloat(rangeMatch[2]);
    }

    // 4. Detect Sorting preference
    if (text.includes('cheap') || text.includes('lowest price') || text.includes('low to high')) {
        sort = 'price';
        order = 'asc';
    } else if (text.includes('expensive') || text.includes('premium') || text.includes('high to low')) {
        sort = 'price';
        order = 'desc';
    } else if (text.includes('best') || text.includes('top rated') || text.includes('rating') || text.includes('popular')) {
        sort = 'rating.average';
        order = 'desc';
    } else if (text.includes('new') || text.includes('latest')) {
        sort = 'createdAt';
        order = 'desc';
    }

    // 5. Clean search keywords (remove stop words, numbers, and filter keywords)
    let keywords = text
        .replace(/(?:under|below|less than|within|upto|up to|above|over|more than|between|from|to|rs\.?|₹|\d+)/gi, '')
        .replace(/\b(for|in|with|and|the|a|an|show|me|find|search|get|i|want|need|looking|cheap|best|top|rated|latest|newest|low|high|price)\b/gi, '')
        .trim();

    // Remove detected category and color from keywords to avoid redundant search noise
    if (category) {
        keywords = keywords.replace(new RegExp(`\\b${category}\\b`, 'gi'), '');
    }
    if (color) {
        keywords = keywords.replace(new RegExp(`\\b${color}\\b`, 'gi'), '');
    }
    keywords = keywords.replace(/\s+/g, ' ').trim();

    // Construct explanation
    const parts = [];
    if (keywords) parts.push(`Keywords: "${keywords}"`);
    if (category) parts.push(`Category: ${category}`);
    if (color) parts.push(`Color: ${color}`);
    if (minPrice && maxPrice) parts.push(`Price: ₹${minPrice} - ₹${maxPrice}`);
    else if (maxPrice) parts.push(`Max Price: ₹${maxPrice}`);
    else if (minPrice) parts.push(`Min Price: ₹${minPrice}`);
    if (sort) parts.push(`Sort: ${sort} (${order})`);

    const explanation = parts.length > 0
        ? `Smart Intent detected -> ${parts.join(' | ')}`
        : `Searching catalog for "${userQuery}"`;

    // Suggestions
    const suggestedQueries = [
        `Popular ${category || 'products'} under ₹${maxPrice || 2000}`,
        `Top rated ${color || 'latest'} items`,
        `Best deals in ${category || 'store'}`
    ];

    return {
        isAiPowered: false,
        rawQuery: userQuery,
        keywords: keywords || userQuery,
        category,
        color,
        minPrice,
        maxPrice,
        sort,
        order,
        explanation,
        suggestedQueries
    };
}

/**
 * Main Smart Search parsing function.
 * Uses Google Gemini API if GEMINI_API_KEY is configured, else uses local NLP parser.
 */
async function parseSmartSearchQuery(userQuery, availableCategories = [], availableColors = []) {
    // Reload dotenv dynamically so .env changes are recognized without restarting server
    require('dotenv').config({ override: true });
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";

    if (!apiKey) {
        console.log("[AI SMART SEARCH] No GEMINI_API_KEY set in .env. Using smart local NLP parser.");
        return localNLPParse(userQuery, availableCategories, availableColors);
    }

    if (!apiKey.startsWith("AIzaSy")) {
        console.warn("[AI SMART SEARCH] Notice: GEMINI_API_KEY in .env does not start with 'AIzaSy'. Standard Google AI Studio API keys start with 'AIzaSy'.");
    }

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: (modelName.includes("1.5") || modelName.includes("2.0"))
                    ? { responseMimeType: "application/json" }
                    : undefined
            });

            const prompt = `You are an expert AI e-commerce query understanding engine for an online store.
Parse the following user search query and extract intent into a JSON object. Return ONLY valid JSON.

User Search Query: "${userQuery}"

Available Categories: ${JSON.stringify(availableCategories)}
Available Colors: ${JSON.stringify(availableColors)}

Output JSON schema must strictly match:
{
  "keywords": "string - core clean search term without stop words or price constraints",
  "category": "string or null - matching one of the Available Categories (case insensitive)",
  "color": "string or null - matching one of the Available Colors or a standard color name",
  "minPrice": "number or null - minimum price extracted in Indian Rupees (INR)",
  "maxPrice": "number or null - maximum price extracted in Indian Rupees (INR)",
  "sort": "string or null - one of ['price', 'rating.average', 'createdAt', null]",
  "order": "string or null - 'asc' or 'desc'",
  "explanation": "string - 1 crisp friendly sentence explaining how AI understood the request",
  "suggestedQueries": ["array of 3 smart alternative search strings related to the user's intent"]
}`;

            const result = await model.generateContent(prompt);
            let text = result.response.text().trim();

            if (text.startsWith("```")) {
                text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
            }

            const parsed = JSON.parse(text);

            return {
                isAiPowered: true,
                aiModelUsed: modelName,
                rawQuery: userQuery,
                keywords: parsed.keywords || userQuery,
                category: parsed.category ? parsed.category.toLowerCase() : null,
                color: parsed.color ? parsed.color.toLowerCase() : null,
                minPrice: parsed.minPrice ? Number(parsed.minPrice) : null,
                maxPrice: parsed.maxPrice ? Number(parsed.maxPrice) : null,
                sort: parsed.sort || null,
                order: parsed.order || null,
                explanation: parsed.explanation || `AI matched items for "${userQuery}"`,
                suggestedQueries: Array.isArray(parsed.suggestedQueries) ? parsed.suggestedQueries.slice(0, 3) : []
            };
        } catch (error) {
            lastError = error;
            console.error(`[AI SMART SEARCH] Gemini Model (${modelName}) error:`, error.message);
        }
    }

    console.log("[AI SMART SEARCH] Gemini API call failed. Falling back to smart local NLP parser.");
    return {
        ...localNLPParse(userQuery, availableCategories, availableColors),
        apiError: lastError ? lastError.message : "API call failed"
    };
}

module.exports = {
    parseSmartSearchQuery,
    localNLPParse
};
