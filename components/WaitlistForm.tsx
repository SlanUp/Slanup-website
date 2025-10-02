"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface WaitlistFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistForm({ isOpen, onClose }: WaitlistFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagram: "",
    city: "",
    countryCode: "+91",
    contact: "",
    comments: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳", maxLength: 10 },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸", maxLength: 10 },
    { code: "+44", country: "UK", flag: "🇬🇧", maxLength: 10 },
    { code: "+971", country: "UAE", flag: "🇦🇪", maxLength: 9 },
    { code: "+65", country: "Singapore", flag: "🇸🇬", maxLength: 8 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate phone number if provided
    if (formData.contact) {
      const selectedCountry = countryCodes.find(c => c.code === formData.countryCode);
      const digitCount = formData.contact.replace(/\D/g, '').length;
      
      if (selectedCountry && digitCount !== selectedCountry.maxLength) {
        newErrors.contact = `Phone number must be ${selectedCountry.maxLength} digits for ${selectedCountry.country}`;
      }
      
      if (!/^\d+$/.test(formData.contact)) {
        newErrors.contact = "Phone number can only contain digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");

    try {
      // Submit to Google Form using hidden iframe
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeDkcb4cXUQ4NFHHFKgA3z6AxF2C_U-KHunL8Vf_zLFXYr51Q/formResponse";
      
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formUrl;
      form.target = 'hidden_iframe';

      const fields = {
        "entry.917600146": formData.name,
        "entry.211962440": formData.email,
        "entry.544898823": formData.instagram,
        "entry.1868989514": formData.city,
        "entry.1271894266": formData.contact ? `${formData.countryCode} ${formData.contact}` : "",
        "entry.1588555925": formData.comments,
        "pageHistory": "0,1", // For multi-page forms
        "fvv": "1",
        "partialResponse": "[null,null,\"0\"]",
        "fbzx": "-1",
      };

      console.log('Submitting form data:', fields);
      console.log('Form URL:', formUrl);

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 1000);

      setMessage("🎉 Thanks for joining! We'll be in touch soon!");
      setFormData({
        name: "",
        email: "",
        instagram: "",
        city: "",
        countryCode: "+91",
        contact: "",
        comments: "",
      });
      setErrors({});
      
      setTimeout(onClose, 2500);
    } catch (error) {
      setMessage("Something went wrong. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Join the Waitlist
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name *"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="Instagram Username *"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Cities you're generally in *"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-24 px-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 text-sm"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="phone - only if comfortable"
                    maxLength={countryCodes.find(c => c.code === formData.countryCode)?.maxLength}
                    className={`flex-1 min-w-0 px-4 py-3 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 text-sm sm:text-base`}
                  />
                </div>
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
                )}
              </div>

              <div>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Any features you'd love to see? (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] bg-white text-gray-900 resize-none text-sm sm:text-base"
                />
              </div>

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm ${message.includes('wrong') ? 'text-red-600' : 'text-green-600'}`}
                >
                  {message}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
