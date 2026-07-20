import React, { useState, useEffect, useContext } from "react";
import { AdminSubscriptionsContext } from "../../../../context/AdminContext/AdminSubscriptionsContext";

const INTERVALS = ["daily", "weekly", "monthly", "yearly"];
const ROLES = ["hospital", "patient"];
const MAX_FEATURES = 5;

const emptyForm = {
  name: "",
  price: "",
  description: "",
  interval: "monthly",
  role: "hospital",
  features: [],
};

// Create Plan Modal
export const CreatePlanModal = ({ onClose }) => {
  const { createPlan, isCreating } = useContext(AdminSubscriptionsContext);

  const [form, setForm] = useState({ ...emptyForm });
  const [newFeature, setNewFeature] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (form.features.length >= MAX_FEATURES) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setNewFeature("");
  };

  const handleRemoveFeature = (idx) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.price === "" || isNaN(Number(form.price))) return;
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      interval: form.interval,
      role: form.role,
      features: form.features,
    };
    createPlan(payload, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-xl font-semibold text-gray-900">Create a new subscription plan</h2>
      <p className="text-sm text-gray-500 mt-1 mb-5">Proceed to create a new subscription plan</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Plan title">
          <input
            id="create-plan-title"
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095]"
            placeholder="e.g. Premium Plan"
          />
        </FormField>

        <FormField label="Plan Price">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">₦</span>
            <input
              id="create-plan-price"
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095]"
              placeholder="0"
            />
          </div>
        </FormField>

        <FormField label="Description">
          <textarea
            id="create-plan-description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095] resize-none"
            placeholder="Describe this plan..."
          />
        </FormField>

        <FormField label="Role">
          <SelectField
            id="create-plan-role"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            options={ROLES}
            capitalize
          />
        </FormField>

        <FormField label="Duration">
          <SelectField
            id="create-plan-interval"
            value={form.interval}
            onChange={(e) => handleChange("interval", e.target.value)}
            options={INTERVALS}
            capitalize
          />
        </FormField>

        <FeaturesList
          features={form.features}
          newFeature={newFeature}
          setNewFeature={setNewFeature}
          onAdd={handleAddFeature}
          onRemove={handleRemoveFeature}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            id="create-plan-submit"
            className="px-5 py-2 rounded-full bg-[#3E4095] text-white text-sm font-semibold hover:bg-[#2e3070] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            )}
            Create plan
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// Edit Plan Modal
export const EditPlanModal = ({ plan, onClose }) => {
  const { updatePlan, isUpdating } = useContext(AdminSubscriptionsContext);

  const [form, setForm] = useState({
    name: plan.name || "",
    price: plan.price ?? "",
    description: plan.description || "",
    interval: plan.interval || "monthly",
    role: plan.role || "hospital",
    features: Array.isArray(plan.features) ? [...plan.features] : [],
  });
  const [newFeature, setNewFeature] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (form.features.length >= MAX_FEATURES) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setNewFeature("");
  };

  const handleRemoveFeature = (idx) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.price === "" || isNaN(Number(form.price))) return;
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      interval: form.interval,
      role: form.role,
      features: form.features,
    };
    updatePlan({ planSqid: plan.sqid, payload }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
      <p className="text-sm text-gray-500 mt-1 mb-5">Edit the features of this plan</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Plan title">
          <div className="relative">
            <input
              id="edit-plan-title"
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095]"
            />
            <PencilIcon />
          </div>
        </FormField>

        <FormField label="Plan Price">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium select-none">₦</span>
            <input
              id="edit-plan-price"
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095]"
            />
            <PencilIcon />
          </div>
        </FormField>

        <FormField label="Description">
          <textarea
            id="edit-plan-description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095] resize-none"
          />
        </FormField>

        <FormField label="Role">
          <SelectField
            id="edit-plan-role"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            options={ROLES}
            capitalize
          />
        </FormField>

        <FormField label="Duration">
          <SelectField
            id="edit-plan-interval"
            value={form.interval}
            onChange={(e) => handleChange("interval", e.target.value)}
            options={INTERVALS}
            capitalize
          />
        </FormField>

        <FeaturesList
          features={form.features}
          newFeature={newFeature}
          setNewFeature={setNewFeature}
          onAdd={handleAddFeature}
          onRemove={handleRemoveFeature}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            id="edit-plan-submit"
            className="px-5 py-2 rounded-full bg-[#3E4095] text-white text-sm font-semibold hover:bg-[#2e3070] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            )}
            Edit plan
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

// Shared Sub-components

const ModalOverlay = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-fade-in-up">
      {children}
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const SelectField = ({ id, value, onChange, options, capitalize }) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095] appearance-none bg-white pr-8"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {capitalize ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}
        </option>
      ))}
    </select>
    <svg
      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

const FeaturesList = ({ features, newFeature, setNewFeature, onAdd, onRemove }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Features{" "}
      <span className="text-gray-400 font-normal">({MAX_FEATURES} max)</span>
    </label>

    <div className="space-y-1.5 mb-2">
      {features.map((feat, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-2 text-sm text-gray-700"
        >
          <span>{feat}</span>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="text-red-500 hover:text-red-700 shrink-0 leading-none"
            aria-label="Remove feature"
          >
            ✕
          </button>
        </div>
      ))}
    </div>

    {features.length < MAX_FEATURES && (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder="Add a feature..."
          className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095]"
        />
        <button
          type="button"
          onClick={onAdd}
          className="text-[#3E4095] font-semibold text-sm hover:underline whitespace-nowrap"
        >
          + Add
        </button>
      </div>
    )}

    {features.length === 0 && (
      <button
        type="button"
        onClick={() => document.querySelector("[placeholder='Add a feature...']")?.focus()}
        className="text-[#3E4095] text-sm font-semibold"
      >
        + Add new feature
      </button>
    )}
  </div>
);

const PencilIcon = () => (
  <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E4095] pointer-events-none"
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2.121 2.121 0 013 3L12 16H9v-3z" />
  </svg>
);
