import Review from "../models/Review.js";

export const listReviews = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10) || 20, 100);
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("username rating message createdAt");

    res.json({ reviews });
  } catch (error) {
    console.error("List reviews error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const createReview = async (req, res) => {
  try {
    // requireAuth already ran; block guests
    if (req.user?.isGuest) {
      return res.status(403).json({ msg: "Guest users cannot add review. Please login." });
    }

    const { message, rating } = req.body || {};
    const trimmed = String(message || "").trim();
    if (!trimmed) {
      return res.status(400).json({ msg: "Message is required" });
    }

    let normalizedRating = null;
    if (rating !== undefined && rating !== null && String(rating) !== "") {
      const r = parseInt(rating, 10);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ msg: "Rating must be between 1 and 5" });
      }
      normalizedRating = r;
    }

    const review = new Review({
      userId: req.user._id,
      username: req.user.username || "User",
      rating: normalizedRating,
      message: trimmed,
    });

    await review.save();

    res.status(201).json({
      msg: "Review added",
      review: {
        _id: review._id,
        username: review.username,
        rating: review.rating,
        message: review.message,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

