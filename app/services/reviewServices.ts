import { api } from "./api";

export interface PendingReview {
  submission_id: number;
  task_id: number;
  submitted_by: number;
  submission_note?: string;
  attachments?: any;
  status: string;
  submitted_at: string;
  updated_at: string;
  task: {
    task_id: number;
    title: string;
    description?: string;
    project: { name: string };
    phase?: { name: string };
    assignee: { user_id: number; full_name: string }[];
  };
  submitter: {
    user_id: number;
    full_name: string;
    email: string;
  };
  reviews?: {
    review_id: number;
    review_note?: string;
    is_approved: boolean;
    reviewed_at: string;
    reviewer: {
      user_id: number;
      full_name: string;
    };
  }[];
}

export const reviewService = {
  async getPendingReviews(all: boolean = true): Promise<PendingReview[]> {
    const response = await api.get(`/reviews/pending?all=${all}`);
    return response?.data || response || [];
  },

  async approveSubmission(submission_id: number, review_note: string = "") {
    return api.post("/reviews/approve", { submission_id, review_note });
  },

  async rejectSubmission(submission_id: number, review_note: string = "") {
    return api.post("/reviews/reject", { submission_id, review_note });
  }
};
