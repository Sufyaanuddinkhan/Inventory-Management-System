import { useEffect, useMemo, useState } from "react";
import "./App.css";

const emptyProduct = {
  name: "",
  id: "",
  sku: "",
  inStock: "",
  price: "",
  category: "",
  status: true,
};



function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All products");
  const [form, setForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/products");
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Could not load products.");
      setProducts(data.products || []);
    } catch (loadError) {
      setError(`${loadError.message} Make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = [
        product.name,
        product.sku,
        product.category,
        product.id,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
      const matchesFilter =
        filter === "All products" ||
        (filter === "In stock" && Number(product.inStock) > 0) ||
        (filter === "Low stock" &&
          Number(product.inStock) > 0 &&
          Number(product.inStock) <= 10) ||
        (filter === "Out of stock" && Number(product.inStock) === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const totalUnits = products.reduce(
    (total, product) => total + (Number(product.inStock) || 0),
    0,
  );
  const lowStockCount = products.filter(
    (product) => Number(product.inStock) > 0 && Number(product.inStock) <= 10,
  ).length;
  const stockValue = products.reduce(
    (total, product) =>
      total + (Number(product.price) || 0) * (Number(product.inStock) || 0),
    0,
  );

  function openNewProduct() {
    setEditingProduct(null);
    setForm(emptyProduct);
    setMessage("");
    setFormOpen(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      id: product.id ?? "",
      sku: product.sku || "",
      inStock: product.inStock ?? "",
      price: product.price ?? "",
      category: product.category || "",
      status: Boolean(product.status),
    });
    setMessage("");
    setFormOpen(true);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const productDetails = {
      ...form,
      id: Number(form.id),
      inStock: Number(form.inStock),
      price: Number(form.price),
    };
    const url = editingProduct
      ? `/products/${editingProduct._id}`
      : "/products";

    try {
      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productDetails),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.msg || "Could not save this product.");

      setMessage(editingProduct ? "Product updated." : "Product added.");
      setFormOpen(false);
      await loadProducts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`))
      return;

    setError("");
    try {
      const response = await fetch(`/products/${product._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.msg || "Could not delete this product.");
      setMessage("Product deleted.");
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="app-shell">

      <section className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumb">
            <strong>Inventory</strong>
          </div>
        </header>

        <div className="page-content" id="inventory">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR STORE AT A GLANCE</div>
              <h1>Inventory</h1>
              <p className="subtitle">
                Keep an eye on what you have and what needs a top-up.
              </p>
            </div>
            <button className="primary-button" onClick={openNewProduct}>
              <span>＋</span> Add a product
            </button>
          </div>

          <div className="summary-grid">
            <article className="summary-card">
              <div className="summary-top">
                <span>Products listed</span>
                <span className="summary-icon purple">▦</span>
              </div>
              <strong>{products.length}</strong>
              <small>different items in your store</small>
            </article>
            <article className="summary-card">
              <div className="summary-top">
                <span>Units on hand</span>
                <span className="summary-icon green">↗</span>
              </div>
              <strong>{totalUnits.toLocaleString("en-IN")}</strong>
              <small>across all products</small>
            </article>
          </div>

          <section className="inventory-panel">

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>IN STOCK</th>
                    <th>STATUS</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="empty-state" colSpan="7">
                        Loading your products...
                      </td>
                    </tr>
                  ) : visibleProducts.length === 0 ? (
                    <tr>
                      <td className="empty-state" colSpan="7">
                        {products.length
                          ? "No products match your search."
                          : "No products yet. Add your first product to get started."}
                      </td>
                    </tr>
                  ) : (
                    visibleProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="product-cell">
                            <span className="product-thumb">
                              {product.name?.charAt(0)?.toUpperCase() || "P"}
                            </span>
                            <span>
                              <strong>{product.name}</strong>
                              <small>ID {product.id}</small>
                            </span>
                          </div>
                        </td>
                        <td className="sku-cell">{product.sku}</td>
                        <td>{product.category}</td>
                        <td className="price-cell">
                          {(product.price)}
                        </td>
                        <td>
                          <span
                            className={`stock-level ${Number(product.inStock) === 0 ? "stock-empty" : Number(product.inStock) <= 10 ? "stock-low" : ""}`}
                          >
                            <i />
                            {product.inStock}{" "}
                            {Number(product.inStock) === 1 ? "unit" : "units"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${product.status ? "status-active" : "status-inactive"}`}
                          >
                            <i />
                            {product.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button onClick={() => openEditProduct(product)}>
                              Edit
                            </button>
                            <button
                              className="delete-action"
                              onClick={() => deleteProduct(product)}
                              aria-label={`Delete ${product.name}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <footer className="table-footer">
              <span>
                Showing {visibleProducts.length} of {products.length} products
              </span>
              <span>
                Stock is looking good <span className="footer-sparkle">✳</span>
              </span>
            </footer>
          </section>
          <footer className="page-footer">
            Made for the everyday bits of running a store <span>✳</span>
          </footer>
        </div>
      </section>

      {formOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFormOpen(false);
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">INVENTORY DETAILS</div>
                <h2 id="form-title">
                  {editingProduct ? "Edit product" : "Add a product"}
                </h2>
              </div>
              <button
                className="close-button"
                onClick={() => setFormOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="modal-intro">A few details and you’re all set.</p>
            <form onSubmit={saveProduct}>
              <label className="form-field full-field">
                Product name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Everyday tote bag"
                />
              </label>
              <div className="form-grid">
                <label className="form-field">
                  Product ID
                  <input
                    required
                    type="number"
                    value={form.id}
                    onChange={(event) =>
                      setForm({ ...form, id: event.target.value })
                    }
                    placeholder="e.g. 1001"
                  />
                </label>
                <label className="form-field">
                  SKU
                  <input
                    required
                    value={form.sku}
                    onChange={(event) =>
                      setForm({ ...form, sku: event.target.value })
                    }
                    placeholder="e.g. BAG-001"
                  />
                </label>
                <label className="form-field">
                  Category
                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    placeholder="e.g. Accessories"
                  />
                </label>
                <label className="form-field">
                  Price (₹)
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="0.00"
                  />
                </label>
                <label className="form-field">
                  Units in stock
                  <input
                    required
                    min="0"
                    type="number"
                    value={form.inStock}
                    onChange={(event) =>
                      setForm({ ...form, inStock: event.target.value })
                    }
                    placeholder="0"
                  />
                </label>
              </div>
              <label className="status-toggle">
                <span>
                  <strong>Active product</strong>
                  <small>
                    Let this product show as active in your inventory.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.checked })
                  }
                />
              </label>
              {error && (
                <p className="notice error-notice" role="alert">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Add product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
