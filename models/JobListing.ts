import { Schema, model } from "mongoose";

export const JobListingModel = model(
  "JobListing",
  new Schema(
    {
      jobId: { type: String, required: true },
      url: { type: String, required: true },
      jobTitle: { type: String, required: true },
      location: { type: String, required: true },
      datePosted: { type: String, required: true },
      companyName: { type: String },
      benefits: { type: Array<String> },
      jobType: { type: String },
      salaryFormatted: { type: String },
      companyRating: { type: String },
      description: { type: String },
      applyLink: { type: String },
      isExpired: { type: Boolean },
      timestamp: { type: String },
    },
    { timestamps: true }
  )
);
