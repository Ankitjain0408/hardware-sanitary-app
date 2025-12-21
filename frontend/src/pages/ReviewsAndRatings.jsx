import { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";

function ReviewsAndRatings({ user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reviews, setReviews] = useState([]);

  const [message, setMessage] = useState("");
  // Store as number (0 means "no rating selected")
  const [rating, setRating] = useState(0);

  const isGuest = !!user?.isGuest;
  const canPost = !!user && !isGuest;

  const rated = useMemo(() => (reviews || []).filter((e) => !!e?.rating), [reviews]);
  const ratedCount = rated.length;
  const avgRating = useMemo(() => {
    if (!rated.length) return null;
    const sum = rated.reduce((acc, e) => acc + (Number(e.rating) || 0), 0);
    return sum / rated.length;
  }, [rated]);

  const renderAsterisks = (value) => {
    const v = Math.max(0, Math.min(5, Number(value) || 0));
    const full = Math.round(v); // simple rounded display
    const text = "*".repeat(full);
    return (
      <span className="font-mono text-sm text-gray-900" aria-label={`${v} out of 5`}>
        {text || "—"}
      </span>
    );
  };

  const renderStarIcons = (value) => {
    const v = Math.max(0, Math.min(5, Number(value) || 0));
    const full = Math.round(v);
    return (
      <span className="inline-flex items-center gap-1" aria-label={`${v} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar key={i} className={i < full ? "text-yellow-500" : "text-gray-300"} />
        ))}
      </span>
    );
  };

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/reviews?limit=30`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      setError(e?.message || "Unable to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please write your review message.");
      return;
    }

    try {
      setSaving(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: trimmed, rating: rating || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || "Failed to submit review");

      setMessage("");
      setRating(0);
      setSuccess("Thanks! Your review was added.");
      await load();
    } catch (e) {
      setError(e?.message || "Unable to submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600 mt-2">Share your review and rating with Shri Krishna Sanitary And Hardware.</p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-gray-50 border border-gray-200 px-4 py-2">
            <div className="text-sm font-semibold text-gray-900">Average Rating</div>
            <div className="flex items-center gap-2">
              {renderStarIcons(avgRating ?? 0)}
              {avgRating !== null ? (
                <span className="text-sm text-gray-700">
                  {avgRating.toFixed(1)} ({ratedCount})
                </span>
              ) : (
                <span className="text-sm text-gray-600">No ratings yet (0)</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 md:p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add your review</h2>

            {!canPost && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm">
                {isGuest ? "Guest users can't add reviews. Please login with your account." : "Please login to add your review."}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating (optional)</label>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const val = i + 1;
                      const active = rating >= val;
                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={saving}
                          onClick={() => setRating((prev) => (prev === val ? 0 : val))}
                          className="p-1"
                          aria-label={`Rate ${val} star${val > 1 ? "s" : ""}`}
                          title={`${val} star${val > 1 ? "s" : ""}`}
                        >
                          <FaStar className={active ? "text-yellow-500 text-xl" : "text-gray-300 text-xl"} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your review</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!canPost || saving}
                  rows={5}
                  placeholder="Write your review..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="mt-1 text-xs text-gray-500">{message.trim().length}/1000</div>
              </div>

              {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
              {success && <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg p-3">{success}</div>}

              <button
                type="submit"
                disabled={!canPost || saving}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition"
              >
                {saving ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent reviews</h2>
              <button
                type="button"
                onClick={load}
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-5 bg-gray-100 rounded" />
                <div className="h-5 bg-gray-100 rounded" />
                <div className="h-5 bg-gray-100 rounded" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-gray-600">No reviews yet. Be the first to add one.</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((ex) => (
                  <div key={ex._id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-gray-900">{ex.username || "User"}</div>
                      <div className="text-xs text-gray-500">
                        {ex.createdAt ? new Date(ex.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    {ex.rating ? <div className="mt-1">{renderAsterisks(ex.rating)}</div> : null}
                    <div className="text-gray-800 mt-2 whitespace-pre-wrap">{ex.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewsAndRatings;

