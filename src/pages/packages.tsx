import { useState } from "react";
import Header from "./header";
import Footer from "./footer";

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
  onSubmit: (formData: FormData) => void;
}

// Modal Component with TypeScript types
const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, packageTitle, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    request: "",
    bookingDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      name: "",
      phone: "",
      email: "",
      request: "",
      bookingDate: "",
    });
  };
//   const handleFormSubmit = (formData) => {
//     const templateParams = {
//       package: selectedPackage,
//       name: formData.name,
//       phone: formData.phone,
//       email: formData.email,
//       request: formData.request,
//       bookingDate: formData.bookingDate,
//     };
  
//     emailjs
//       .send("your_service_id", "your_template_id", templateParams, "your_public_key")
//       .then((response) => {
//         console.log("Email sent successfully!", response.status, response.text);
//       })
//       .catch((error) => {
//         console.error("Failed to send email:", error);
//       });
  
//     onClose();
//   };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
          Book {packageTitle}
        </h2>
        {packageTitle === "Wedding Photography Package" && (
          <p className="text-[var(--secondary)] mb-4">
            We’d love to sit down and discuss your wedding photography needs in detail. After submitting, we’ll reach out to schedule a meeting!
          </p>
        )}
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
              className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              className="w-full px-3 py-2 bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--secondary)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:bg-opacity-80 transition-all duration-300"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Packages() {
  const [weddingHours, setWeddingHours] = useState(4);
  const pricePerHour = 500;

  const calculateWeddingPrice = (hours: number) => {
    return `$${hours * pricePerHour}`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const openModal = (pkgTitle: string) => {
    setSelectedPackage(pkgTitle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const handleFormSubmit = (formData: FormData) => {
    console.log("Booking Request:", {
      package: selectedPackage,
      ...formData,
    });
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
    if (weddingHours < 12) {
      setWeddingHours(weddingHours + 1);
    }
  };

  const decreaseHours = () => {
    if (weddingHours > 2) {
      setWeddingHours(weddingHours - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex flex-col flex-grow px-4 py-8">
        <div className="section-container w-full max-w-7xl mx-auto">
          <p className="text-center text-[var(--secondary)] text-lg mb-10">
            Explore Tx Media’s tailored packages for drone media, weddings, and baby photography. Contact us for custom options!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photoPackages.map((pkg, index) => (
              <div
                key={index}
                className="bg-[var(--gradient-start)] border border-[var(--secondary)]/20 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">
                    {pkg.title}
                  </h2>
                  <p className="text-[var(--secondary)] mb-4">{pkg.description}</p>
                  <ul className="text-[var(--foreground)] text-sm space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[var(--accent)]">•</span> {feature}
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
                        disabled={weddingHours >= 12}
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