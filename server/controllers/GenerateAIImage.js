import * as dotenv from "dotenv";
import { createError } from "../error.js";
import fetch from "node-fetch";

dotenv.config();

// Controller to generate Image using Stability AI
export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    // Stability AI API endpoint for text-to-image
    const engineId = "stable-diffusion-xl-1024-v1-0"; // You can change this to other engines as needed
    const apiHost = "https://api.stability.ai";
    const apiKey = process.env.STABILITY_API_KEY;
    
    if (!apiKey) {
      return next(createError(400, "Missing Stability API key"));
    }

    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1.0,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate image");
    }

    const responseData = await response.json();
    
    // Stability AI returns base64 images in the artifacts array
    const generatedImage = responseData.artifacts[0].base64;
    
    return res.status(200).json({ photo: generatedImage });
  } catch (error) {
    next(
      createError(
        error.status || 500,
        error.message || "Failed to generate image"
      )
    );
  }
};