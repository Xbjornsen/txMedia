import { useState, useEffect } from "react";
import Header from "./header";
import Footer from "./footer";
import emailjs from "emailjs-com";

// Define the type for form data
interface FormData {
  name: string;
  phone: string;
  email: string;
  request: string;
  bookingDate: string;
}

// Define the props type for BookingModal
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string | null;
  onSubmit: (formData: FormData) => Promise<void>;
}

// Define the props type for SuccessModal
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Success Modal Component
const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose(); // Auto-close after 3 seconds
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] rounded-xl p-6 w-full max-w-sm mx-4 text-center">
        <div className="text-green-500 text-4xl mb-4">✔</div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
          Email Sent Successfully!
        </h2>
        <p className="text-[var(--secondary)]">
          Your booking request has been sent to TxMedia. We’ll respond to you as
          soon as possible.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-all duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  packageTitle,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    request: "",
    bookingDate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false); // Local success state

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.bookingDate
    ) {
      setError("Please fill out all required fields.");
      return;
    }
    setIsLoading(true); // Start spinner only after valid submission
    try {
      await onSubmit(formData);
      setIsSuccessOpen(true); // Show success modal on top
      setFormData({
        name: "",
        phone: "",
        email: "",
        request: "",
        bookingDate: "",
      });
    } catch (error) {
      setIsLoading(false); // Reset spinner on error
      setError(`Failed to send your request. Please try again. ${error}`);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    setIsLoading(false); // Reset spinner
    onClose(); // Close both modals
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-[var(--background)] rounded-xl p-6 w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Book {packageTitle}
          </h2>
          {packageTitle === "Wedding Photography Package" && (
            <p className="text-[var(--secondary)] mb-4">
              We’d love to sit down and discuss your wedding photography needs
              in detail. After submitting, we’ll reach out to schedule a
              meeting!
            </p>
          )}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--foreground)] text-sm mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[var(--foreground)] text-sm mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[var(--foreground)] text-sm mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[var(--foreground)] text-sm mb-1">
                Specific Requests
              </label>
              <textarea
                name="request"
                value={formData.request}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-[var(--foreground)] text-sm mb-1">
                Desired Booking Date
              </label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-[var(--background)]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <SuccessModal isOpen={isSuccessOpen} onClose={handleSuccessClose} />
    </>
  );
};

export default function Packages() {
  const [weddingHours, setWeddingHours] = useState(4);
  const pricePerHour = 500;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const calculateWeddingPrice = (hours: number) => {
    return `$${hours * pricePerHour}`;
  };

  const openModal = (pkgTitle: string) => {
    setSelectedPackage(pkgTitle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS env vars missing:", {
        serviceId,
        templateId,
        publicKey,
      });
      throw new Error("Configuration error. Please contact support.");
    }

    const templateParams = {
      package: selectedPackage,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      request: formData.request,
      bookingDate: formData.bookingDate,
      time: new Date().toLocaleString(),
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
  };

  const photoPackages = [
    {
      title: "Drone Media Package",
      description:
        "Perfect for businesses, real estate, or social media content. Includes aerial photography and short video clips captured with professional drones.",
      features: [
        "Up to 1 hour of drone shooting",
        "10 edited high-resolution photos",
        "30s to 1-minute edited video, portrait or Landscape",
        "Digital delivery within 48 hours",
      ],
      price: "$750",
    },
    {
      title: "Wedding Photography Package",
      description:
        "Capture your special day with stunning photos. Includes a mix of candid and posed shots. Adjust the hours below to fit your needs!",
      features: [
        `Up to ${weddingHours} hours of coverage`,
        "100 edited high-resolution photos",
        "Optional drone shots (weather permitting)",
      ],
      price: calculateWeddingPrice(weddingHours),
    },
    {
      title: "Baby Photography Package",
      description:
        "Cherish those early moments with a gentle, professional session. Ideal for newborns or milestones.",
      features: [
        "1-hour on-location session",
        "15 edited high-resolution photos",
        "Custom props and setups",
        "Digital delivery within 72 hours",
      ],
      price: "$450",
    },
  ];

  const increaseHours = () => {
    if (weddingHours < 8) setWeddingHours(weddingHours + 1);
  };

  const decreaseHours = () => {
    if (weddingHours > 2) setWeddingHours(weddingHours - 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex flex-col flex-grow px-4 py-8">
        <div className="section-container w-full max-w-7xl mx-auto">
          <p className="text-center text-[var(--secondary)] text-lg mb-10">
            Explore Tx Media’s tailored packages for drone media, weddings, and
            baby photography. Contact us for custom options!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photoPackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--secondary-alt)] mb-4">
                    {pkg.title}
                  </h2>
                  <p className="text-[var(--secondary)] mb-4">
                    {pkg.description}
                  </p>
                  <ul className="text-[var(--foreground)] text-sm space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[var(--secondary-alt)]">•</span>{" "}
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {pkg.title === "Wedding Photography Package" && (
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={decreaseHours}
                        disabled={weddingHours <= 2}
                        className="px-3 py-1 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        -
                      </button>
                      <span className="text-[var(--foreground)] text-sm">
                        {weddingHours} hours
                      </span>
                      <button
                        onClick={increaseHours}
                        disabled={weddingHours >= 8}
                        className="px-3 py-1 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[var(--foreground)] text-xl font-bold mb-4">
                    {pkg.price}
                  </p>
                  <button
                    onClick={() => openModal(pkg.title)}
                    className="inline-block px-6 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-all duration-300"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <BookingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        packageTitle={selectedPackage}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
