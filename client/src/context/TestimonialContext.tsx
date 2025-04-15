import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { AuthContext } from "./AuthContext";
import {
  getTestimonials as apiGetTestimonials,
  addTestimonial as apiAddTestimonial,
  deleteTestimonial as apiDeleteTestimonial,
} from "../services/api";

interface Testimonial {
  id: number;
  userId: number;
  userEmail: string;
  content: string;
  rating: number;
  createdAt: string;
}

interface TestimonialFormData {
  content: string;
  rating: number;
}

interface TestimonialContextType {
  testimonials: Testimonial[];
  loading: boolean;
  fetchTestimonials: () => Promise<void>;
  addTestimonial: (data: TestimonialFormData) => Promise<Testimonial>;
  deleteTestimonial: (id: number) => Promise<boolean>;
}

interface TestimonialProviderProps {
  children: ReactNode;
}

export const TestimonialContext = createContext<TestimonialContextType>({
  testimonials: [],
  loading: true,
  fetchTestimonials: async () => {},
  addTestimonial: async () => ({
    id: 0,
    userId: 0,
    userEmail: "",
    content: "",
    rating: 0,
    createdAt: "",
  }),
  deleteTestimonial: async () => false,
});

export const TestimonialProvider = ({ children }: TestimonialProviderProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Add the AuthContext to access user

  // Fetch testimonials on load
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await apiGetTestimonials();
      setTestimonials(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setLoading(false);
    }
  };

  const addTestimonial = async (testimonialData: TestimonialFormData) => {
    try {
      const res = await apiAddTestimonial(testimonialData);

      // Ensure the response has all required fields properly formatted
      const newTestimonial = {
        ...res.data,
        // Make sure createdAt exists and is properly formatted
        createdAt: res.data.createdAt || new Date().toISOString(),
        // Ensure user email is present
        userEmail: res.data.userEmail || user?.email || "Anonymous",
      };

      setTestimonials([...testimonials, newTestimonial]);
      return newTestimonial;
    } catch (error) {
      console.error("Error adding testimonial:", error);
      throw error;
    }
  };

  const deleteTestimonial = async (id: number) => {
    try {
      await apiDeleteTestimonial(id);
      setTestimonials(testimonials.filter((t) => t.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      throw error;
    }
  };

  return (
    <TestimonialContext.Provider
      value={{
        testimonials,
        loading,
        fetchTestimonials,
        addTestimonial,
        deleteTestimonial,
      }}
    >
      {children}
    </TestimonialContext.Provider>
  );
};
