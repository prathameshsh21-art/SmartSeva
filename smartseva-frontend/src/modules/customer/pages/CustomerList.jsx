import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import CustomerTable from '../components/CustomerTable';
import AddCustomerModal from '../components/AddCustomerModal';

import { customerService } from '../../../api/services/customerService';

export default function CustomerList() {

    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);


    // =========================
    // LOAD CUSTOMERS
    // =========================

    const loadCustomers = async (pageNumber = page, searchQuery = search) => {
        setLoading(true);
        setError(null);

        try {
            const response = searchQuery && searchQuery.trim() !== ''
                ? await customerService.search(searchQuery.trim(), pageNumber, 10)
                : await customerService.getAll(pageNumber, 10);

            const pageData = response?.data;

            if (pageData && Array.isArray(pageData.content)) {
                setCustomers(pageData.content);
                setTotalPages(pageData.totalPages || 1);
            } else if (Array.isArray(pageData)) {
                setCustomers(pageData);
                setTotalPages(1);
            } else {
                setCustomers([]);
                setTotalPages(1);
            }

        } catch (err) {
            console.error('Failed to load customers:', err);
            setError('Failed to load customer records.');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };


    // =========================
    // INITIAL LOAD & PAGE EFFECT
    // =========================

    useEffect(() => {
        loadCustomers(page, search);
    }, [page]);


    // =========================
    // SEARCH
    // =========================

    const handleSearch = async (value) => {
        setSearch(value);
        setPage(0);
        await loadCustomers(0, value);
    };


    // =========================
    // ADD CUSTOMER
    // =========================

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setShowModal(true);
    };


    // =========================
    // SAVE / UPDATE CUSTOMER
    // =========================

    const handleSaveCustomer = async (data) => {
        try {
            if (editingCustomer) {
                const response = await customerService.update(editingCustomer.customerId, data);
                if (response?.success === false) {
                    alert(response.message || 'Customer update failed');
                    return;
                }
                alert('Customer updated successfully!');
            } else {
                const response = await customerService.create(data);
                if (response?.success === false) {
                    alert(response.message || 'Customer creation failed');
                    return;
                }
                alert('Customer registered successfully!');
            }

            setShowModal(false);
            setEditingCustomer(null);
            await loadCustomers(page, search);

        } catch (err) {
            console.error('Customer save failed:', err);
            alert(err?.message || 'Failed to save customer');
        }
    };


    // =========================
    // VIEW CUSTOMER
    // =========================

    const handleView = (customer) => {
        if (customer?.customerId) {
            navigate(`/customers/${customer.customerId}`);
        }
    };


    // =========================
    // EDIT CUSTOMER
    // =========================

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowModal(true);
    };


    // =========================
    // DELETE / ARCHIVE CUSTOMER
    // =========================

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to archive this customer?'
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await customerService.delete(id);
            if (response?.success === false) {
                alert(response.message || 'Failed to archive customer');
                return;
            }

            alert('Customer archived successfully!');
            await loadCustomers(page, search);

        } catch (err) {
            console.error('Delete failed:', err);
            alert(err?.message || 'Failed to archive customer');
        }
    };


    return (
        <div>
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold">Customer Directory</h3>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddCustomer}
                >
                    + Add Customer
                </button>
            </div>

            {/* SEARCH */}
            <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search by name or phone..."
            />

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* CUSTOMER TABLE */}
            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <CustomerTable
                    customers={customers}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* PAGINATION */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
            />

            {/* ADD / EDIT CUSTOMER MODAL */}
            <AddCustomerModal
                show={showModal}
                initialData={editingCustomer}
                onClose={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                }}
                onSave={handleSaveCustomer}
            />
        </div>
    );
}