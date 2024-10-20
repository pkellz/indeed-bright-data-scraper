import * as express from "express";
import { Request, Response } from "express";
import { JobListingModel } from "./models/JobListing";

const router = express.Router();

type JobListing = {
  jobId: string;
  url: string;
  jobTitle: string;
  location: string;
  companyName?: string;
  benefits?: string[];
  jobType?: string;
  salaryFormatted?: string | null;
  companyRating?: string | number;
  datePosted: string;
  description?: string;
  applyLink?: string;
  isExpired?: boolean;
  timestamp?: string;
};

// Start the job search
router.post("/find-jobs", async (req: Request, res: Response) => {
  const reqBody = req.body;

  try {
    const { keywordSearch, location } = reqBody;

    if (!keywordSearch || !location) {
      const errorMessage = "Invalid request body";

      console.error(errorMessage);
      return res.status(400).send(errorMessage);
    }

    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l4dx9j9sscpvs7no2&endpoint=${process.env.BRIGHT_DATA_WEBHOOK_ENDPOINT}&format=json&uncompressed_webhook=true&type=discover_new&discover_by=keyword&limit_per_input=10`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BRIGHT_DATA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            country: "US",
            domain: "indeed.com",
            keyword_search: keywordSearch,
            location: location,
          },
        ]),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to initiate job search");
    }

    console.log({ message: "Job search initiated" });

    return res.send({
      success: true,
      message: "Job search initiated",
    });
  } catch (error) {
    console.error({ message: "An error has occurred", error });
    return res.status(500).send("An unexpected error has occurred");
  }
});

// Receives webhook from Bright Data with job listing info
router.post("/indeed-listings", async (req: Request, res: Response) => {
  const rawJobListings: unknown = req.body;

  if (!Array.isArray(rawJobListings)) {
    const errorMessage = "Invalid request body";

    console.error(errorMessage, rawJobListings);
    return res.status(400).send(errorMessage);
  }

  // Transform the raw job listings into the format we want to store in the database
  const jobListings: JobListing[] = rawJobListings.map((jobListing) => {
    return {
      jobId: jobListing.jobid || "",
      companyName: jobListing.company_name || "",
      jobTitle: jobListing.job_title || "",
      location: jobListing.location || "",
      url: jobListing.url || "",
      benefits: jobListing.benefits,
      jobType: jobListing.job_type,
      salaryFormatted: jobListing.salary_formatted || "N/A",
      companyRating: jobListing.company_rating,
      datePosted: jobListing.date_posted,
      description: jobListing.description,
      applyLink: jobListing.apply_link,
      isExpired: jobListing.is_expired,
      timestamp: jobListing.timestamp,
    };
  });

  try {
    // Insert the job listings into the database
    await JobListingModel.insertMany(jobListings).catch((error) => {
      console.error({ message: "Failed to insert job listings", error });
      throw new Error("Failed to insert job listings");
    });

    console.log({
      message: "Listings inserted successfully",
      results: jobListings.map((j) => j.jobId),
    });

    return res.send({
      success: true,
      message: "Listings inserted successfully",
    });
  } catch (error) {
    console.error({ message: "An error has occurred", error });
    return res.status(500).send("An unexpected error has occurred");
  }
});

export { router };
