"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

const Image = dynamic(() => import("next/image"), {
  ssr: false,
});

interface Land {
  id: number;
  name: string;
  location: string;
  area: number;
  price: number;
  image: string;
  available: boolean;
  land_category: string;
  tehsil_name: string;
  district_name: string;
  state: string;
}

interface NewLand {
  name: string;
  location: string;
  area: number | "";
  price: number | "";
  image: string;
  land_category: string;
  tehsil_name: string;
  district_name: string;
  state: string;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [lands, setLands] = useState<Land[]>([]);
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [newLand, setNewLand] = useState<NewLand>({
    name: "",
    location: "",
    area: "",
    price: "",
    image: "",
    land_category: "",
    tehsil_name: "",
    district_name: "",
    state: "",
  });

  const URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.7:5000";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchLands = async () => {
    try {
      const response = await fetch(`${URL}/api/lands/`);
      const data = await response.json();
      setLands(data);
    } catch (error) {
      console.error("Error fetching lands:", error);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchLands();
    }
  }, [isMounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setNewLand((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!newLand.name.trim()) errors.name = "Name is required";
    if (!newLand.location.trim()) errors.location = "Location is required";
    if (!newLand.area) errors.area = "Area is required";
    if (!newLand.price) errors.price = "Price is required";
    if (!newLand.land_category.trim())
      errors.land_category = "Land category is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${URL}/api/lands/upload-image/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await response.json();
      return data.image_path;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const createLand = async (landData: any) => {
    const response = await fetch(`${URL}/api/lands/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(landData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create land entry");
    }

    return response.json();
  };

  const postLand = async () => {
    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    try {
      let imagePath = "/media/land_images/default.jpg";

      if (selectedFile) {
        try {
          imagePath = await uploadImage(selectedFile);
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Image upload failed, proceeding with default image");
        }
      }

      const landData = {
        name: newLand.name,
        location: newLand.location,
        area: Number(newLand.area),
        price: Number(newLand.price),
        image: imagePath,
        available: true,
        land_category: newLand.land_category,
        tehsil_name: newLand.tehsil_name || "",
        district_name: newLand.district_name || "",
        state: newLand.state || "",
      };

      await createLand(landData);

      fetchLands();
      alert("Land added successfully!");

      // Reset form
      setNewLand({
        name: "",
        location: "",
        area: "",
        price: "",
        image: "",
        land_category: "",
        tehsil_name: "",
        district_name: "",
        state: "",
      });
      setSelectedFile(null);
      setSelectedFileName("");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error details:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to add land. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const openModal = (land: Land) => {
    setSelectedLand(land);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLand(null);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Available Lands</h1>
          <button
            className={styles.addButton}
            onClick={() => setIsFormOpen(true)}
          >
            + Add New Land
          </button>
        </div>

        <div className={styles.grid}>
          {lands.map((land) => (
            <div
              key={land.id}
              className={styles.card}
              onClick={() => openModal(land)}
            >
              <Image
                src={URL + land.image}
                alt={land.name}
                width={300}
                height={200}
                className={styles.image}
                priority={false}
                loading="lazy"
              />
              <h2 className={styles.cardTitle}>{land.name}</h2>
              <p className={styles.cardText}>{land.location}</p>
              <p className={styles.price}>₹{land.price}</p>
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-2xl font-bold mb-4">Add New Land</h2>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="name"
                placeholder="Land Name"
                value={newLand.name}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  formErrors.name ? styles.errorInput : ""
                }`}
              />
              {formErrors.name && (
                <span className={styles.errorText}>{formErrors.name}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newLand.location}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  formErrors.location ? styles.errorInput : ""
                }`}
              />
              {formErrors.location && (
                <span className={styles.errorText}>{formErrors.location}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="number"
                name="area"
                placeholder="Area (sq. meters)"
                value={newLand.area}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  formErrors.area ? styles.errorInput : ""
                }`}
              />
              {formErrors.area && (
                <span className={styles.errorText}>{formErrors.area}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={newLand.price}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  formErrors.price ? styles.errorInput : ""
                }`}
              />
              {formErrors.price && (
                <span className={styles.errorText}>{formErrors.price}</span>
              )}
            </div>

            <div className={styles.fileInputContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="imageInput"
                disabled={isUploading}
              />
              <label htmlFor="imageInput" className={styles.fileInputLabel}>
                {isUploading
                  ? "Uploading..."
                  : selectedFileName || "Choose Image (Optional)"}
              </label>
              {selectedFileName && (
                <p className={styles.selectedFile}>
                  Selected: {selectedFileName}
                </p>
              )}
              {isUploading && (
                <div className={styles.uploadProgress}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="land_category"
                placeholder="Land Category"
                value={newLand.land_category}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  formErrors.land_category ? styles.errorInput : ""
                }`}
              />
              {formErrors.land_category && (
                <span className={styles.errorText}>
                  {formErrors.land_category}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="tehsil_name"
                placeholder="Tehsil Name"
                value={newLand.tehsil_name}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="district_name"
                placeholder="District Name"
                value={newLand.district_name}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={newLand.state}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <button
              className={`${styles.saveButton} ${
                isUploading ? styles.disabled : ""
              }`}
              onClick={postLand}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Save"}
            </button>
            <button
              className={styles.closeButton}
              onClick={() => setIsFormOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedLand && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-2xl font-bold mb-4">{selectedLand.name}</h2>
            <Image
              src={URL + selectedLand.image}
              alt={selectedLand.name}
              width={500}
              height={300}
              className="w-full h-56 object-cover rounded-lg"
              loading="lazy"
            />
            <p className={styles.cardText}>
              <strong>Location:</strong> {selectedLand.location}
            </p>
            <p className={styles.cardText}>
              <strong>Area:</strong> {selectedLand.area} sq. meters
            </p>
            <p className={styles.cardText}>
              <strong>Category:</strong> {selectedLand.land_category}
            </p>
            <p className={styles.cardText}>
              <strong>Tehsil:</strong> {selectedLand.tehsil_name}
            </p>
            <p className={styles.cardText}>
              <strong>District:</strong> {selectedLand.district_name}
            </p>
            <p className={styles.cardText}>
              <strong>State:</strong> {selectedLand.state}
            </p>
            <p className={styles.price}>₹{selectedLand.price}</p>
            <button className={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
