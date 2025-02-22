"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

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

export default function Home() {
  const [lands, setLands] = useState<Land[]>([]);
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newLand, setNewLand] = useState({
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

  const fetchLands = async () => {
    try {
      const response = await fetch("http://172.16.3.241:5000/api/lands/");
      const data = await response.json();
      setLands(data);
    } catch (error) {
      console.error("Error fetching lands:", error);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLand({ ...newLand, [name]: value });
  };

  const postLand = async () => {
    try {
      const response = await fetch("http://172.16.3.241:5000/api/lands/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLand),
      });

      if (response.ok) {
        fetchLands(); // Refresh list
        alert("Land added successfully!");
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
        setIsFormOpen(false); // Close form
      } else {
        console.error("Failed to add land");
      }
    } catch (error) {
      console.error("Error adding land:", error);
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Available Lands</h1>
          <button className={styles.addButton} onClick={() => setIsFormOpen(true)}>
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
                src={land.image}
                alt={land.name}
                width={300}
                height={200}
                className={styles.image}
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

            <input type="text" name="name" placeholder="Land Name" value={newLand.name} onChange={handleInputChange} className={styles.input} />
            <input type="text" name="location" placeholder="Location" value={newLand.location} onChange={handleInputChange} className={styles.input} />
            <input type="number" name="area" placeholder="Area (sq. meters)" value={newLand.area} onChange={handleInputChange} className={styles.input} />
            <input type="number" name="price" placeholder="Price" value={newLand.price} onChange={handleInputChange} className={styles.input} />
            <input type="text" name="image" placeholder="Image URL" value={newLand.image} onChange={handleInputChange} className={styles.input} />
            <input type="text" name="land_category" placeholder="Land Category" value={newLand.land_category} onChange={handleInputChange} className={styles.input} />
            <input type="text" name="tehsil_name" placeholder="Tehsil Name" value={newLand.tehsil_name} onChange={handleInputChange} className={styles.input} />
            <input type="text" name="district_name" placeholder="District Name" value={newLand.district_name} onChange={handleInputChange} className={styles.input} />
            <input type="text" name="state" placeholder="State" value={newLand.state} onChange={handleInputChange} className={styles.input} />

            <button className={styles.saveButton} onClick={postLand}>Save</button>
            <button className={styles.closeButton} onClick={() => setIsFormOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isModalOpen && selectedLand && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-2xl font-bold mb-4">{selectedLand.name}</h2>
            <Image
              src={selectedLand.image}
              alt={selectedLand.name}
              width={500}
              height={300}
              className="w-full h-56 object-cover rounded-lg"
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
