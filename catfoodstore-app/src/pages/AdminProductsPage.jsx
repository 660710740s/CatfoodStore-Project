import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminProductsPage() {
  // เช็คสิทธิ์ก่อนเข้าหน้า
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      alert("คุณไม่มีสิทธิ์เข้าหน้านี้");
      window.location.href = "/";
    }
  }, []);

  const [products, setProducts] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editItem, setEditItem] = useState(null);

  const token = localStorage.getItem("token");

  // ==========================
  // LOAD PRODUCTS FROM API
  // ==========================
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================
  // ADD PRODUCT (POST)
  // ==========================
  const addProduct = async () => {
    if (!newName || !newPrice || !newImage || !newDesc) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      await axios.post(
        "/api/admin/products",
        {
          name: newName,
          description: newDesc,
          price: Number(newPrice),
          weight: "1kg",
          age_group: "kitten",
          breed_type: ["all"],
          category: "dry",
          image_url: newImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("เพิ่มสินค้าสำเร็จ");
      setShowAddForm(false);
      setNewName("");
      setNewPrice("");
      setNewImage("");
      setNewDesc("");

      fetchProducts();
    } catch (err) {
      console.log("Add error:", err);
      alert("เพิ่มสินค้าไม่สำเร็จ");
    }
  };

  // ==========================
  // UPDATE PRODUCT (PUT)
  // ==========================
  const updateProduct = async () => {
    try {
      await axios.put(
        `/api/admin/products/${editItem.id}`,
        editItem,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("บันทึกการแก้ไขสำเร็จ");
      setEditItem(null);
      fetchProducts();
    } catch (err) {
      console.log("Update error:", err);
      alert("แก้ไขไม่สำเร็จ");
    }
  };

  // ==========================
  // DELETE PRODUCT
  // ==========================
  const deleteProduct = async (id) => {
    if (!window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    try {
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("ลบสินค้าสำเร็จ");
      fetchProducts();
    } catch (err) {
      console.log("Delete error:", err);
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        จัดการสินค้า (Admin)
      </h1>

      {/* BUTTON ADD */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + เพิ่มสินค้า
        </button>
      </div>

      {/* ADD PRODUCT FORM */}
      {showAddForm && (
        <div className="border p-6 bg-gray-50 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-4">เพิ่มสินค้าใหม่</h2>

          <div className="grid gap-4">
            <input
              type="text"
              placeholder="ชื่อสินค้า"
              className="border p-2 rounded"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              type="number"
              placeholder="ราคา"
              className="border p-2 rounded"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />

            <input
              type="text"
              placeholder="ลิงก์รูปสินค้า"
              className="border p-2 rounded"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
            />

            <textarea
              placeholder="รายละเอียดสินค้า"
              className="border p-2 rounded h-24"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            ></textarea>
          </div>

          <button
            onClick={addProduct}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            บันทึกสินค้า
          </button>
        </div>
      )}

      {/* PRODUCT TABLE */}
      <table className="w-full border rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border p-2">ภาพ</th>
            <th className="border p-2">ชื่อสินค้า</th>
            <th className="border p-2">ราคา</th>
            <th className="border p-2">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="text-center">
              <td className="border p-2">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-16 h-16 object-cover mx-auto rounded"
                />
              </td>

              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.price} บาท</td>

              <td className="border p-2 space-x-2">
                <button
                  onClick={() => setEditItem(p)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  แก้ไข
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT POPUP */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">แก้ไขสินค้า</h2>

            <input
              type="text"
              className="border p-2 w-full mb-3 rounded"
              value={editItem.name}
              onChange={(e) =>
                setEditItem({ ...editItem, name: e.target.value })
              }
            />

            <input
              type="number"
              className="border p-2 w-full mb-3 rounded"
              value={editItem.price}
              onChange={(e) =>
                setEditItem({ ...editItem, price: Number(e.target.value) })
              }
            />

            <input
              type="text"
              className="border p-2 w-full mb-3 rounded"
              value={editItem.image_url}
              onChange={(e) =>
                setEditItem({ ...editItem, image_url: e.target.value })
              }
            />

            <textarea
              className="border p-2 w-full mb-3 rounded h-24"
              value={editItem.description}
              onChange={(e) =>
                setEditItem({ ...editItem, description: e.target.value })
              }
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                ยกเลิก
              </button>

              <button
                onClick={updateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
