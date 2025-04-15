import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { TestimonialContext } from "../context/TestimonialContext";
import LoadingSpinner from "../components/LoadingSpinner";

interface TestimonialForm {
  content: string;
  rating: number;
}

const Testimonials = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const {
    testimonials,
    loading,
    addTestimonial,
    deleteTestimonial,
    fetchTestimonials,
  } = useContext(TestimonialContext);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TestimonialForm>({
    content: "",
    rating: 5, // Default rating
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      content: e.target.value,
    });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      rating: parseInt(e.target.value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      setError("You must be logged in to leave a testimonial");
      return;
    }

    if (formData.content.trim().length < 10) {
      setError("Testimonial content must be at least 10 characters long");
      return;
    }

    try {
      await addTestimonial(formData);
      setSuccess("Your testimonial has been added successfully!");
      setFormData({
        content: "",
        rating: 5,
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add testimonial");
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await deleteTestimonial(id);
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="testimonials-container">
      <h2>User Testimonials</h2>
      <p className="intro-text">
        See what our users are saying about our password manager. If you're a
        user, we'd love to hear your feedback too!
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isAuthenticated && (
        <div className="testimonial-form-toggle">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Share Your Experience
            </button>
          ) : (
            <div className="form-card">
              <h3>Add Your Testimonial</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="content">Your Feedback</label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={handleContentChange}
                    rows={4}
                    required
                    placeholder="Share your experience with our password manager..."
                  />
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="rating-label">
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          checked={formData.rating === value}
                          onChange={handleRatingChange}
                        />
                        <span className="star">{value} ★</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Submit Testimonial
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="testimonials-list">
          {testimonials.length === 0 ? (
            <div className="empty-state">
              <p>No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="user-info">
                    <span className="user-email">
                      {testimonial.userEmail || "Anonymous"}
                    </span>
                    <div className="rating">
                      {renderStars(testimonial.rating || 5)}
                    </div>
                  </div>
                  {isAuthenticated &&
                    user?.id &&
                    testimonial.userId &&
                    String(user.id) === String(testimonial.userId) && (
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="btn-icon btn-danger"
                        title="Delete"
                      >
                        Delete
                      </button>
                    )}
                </div>
                <p className="testimonial-content">{testimonial.content}</p>
                <div className="testimonial-date">
                  {testimonial.createdAt
                    ? new Date(testimonial.createdAt).toLocaleDateString()
                    : "Recently added"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Testimonials;
