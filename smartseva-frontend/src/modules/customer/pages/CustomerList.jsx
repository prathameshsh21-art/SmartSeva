import React, { useEffect, useState } from 'react';

import SearchBar from '../../../components/common/SearchBar';
import Pagination from '../../../components/common/Pagination';
import CustomerTable from '../components/CustomerTable';
import AddCustomerModal from '../components/AddCustomerModal';

import { customerService } from '../../../api/services/customerService';

export default function CustomerList() {

    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);


    // =========================
    // LOAD CUSTOMERS
    // =========================

    const loadCustomers = async () => {

        try {

            const response =
                await customerService.search(search);

            console.log(
                'Customer API Response:',
                response
            );

            /*
             * Axios interceptor returns response.data.
             *
             * Therefore response is:
             *
             * {
             *   success: true,
             *   message: "...",
             *   data: {
             *      content: [...]
             *   }
             * }
             */

            const pageData = response?.data;

            if (!pageData) {

                setCustomers([]);

                return;
            }


            /*
             * Spring Page response
             */

            if (Array.isArray(pageData.content)) {

                setCustomers(pageData.content);

            } else if (Array.isArray(pageData)) {

                setCustomers(pageData);

            } else {

                setCustomers([]);

            }

        } catch (error) {

            console.error(
                'Failed to load customers:',
                error
            );

            setCustomers([]);

        }

    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        loadCustomers();

    }, []);


    // =========================
    // SEARCH
    // =========================

    const handleSearch = async (value) => {

        setSearch(value);

        try {

            const response =
                await customerService.search(value);

            console.log(
                'Search Response:',
                response
            );

            const pageData = response?.data;

            if (!pageData) {

                setCustomers([]);

                return;
            }


            if (Array.isArray(pageData.content)) {

                setCustomers(pageData.content);

            } else if (Array.isArray(pageData)) {

                setCustomers(pageData);

            } else {

                setCustomers([]);

            }

        } catch (error) {

            console.error(
                'Search failed:',
                error
            );

            setCustomers([]);

        }

    };


    // =========================
    // OPEN ADD CUSTOMER MODAL
    // =========================

    const handleAddCustomer = () => {

        setShowModal(true);

    };


    // =========================
    // SAVE CUSTOMER
    // =========================

    const handleSaveCustomer = async (data) => {

        try {

            console.log(
                'Data going to backend:',
                data
            );

            const response =
                await customerService.create(data);

            console.log(
                'Create Response:',
                response
            );


            if (response?.success === false) {

                alert(
                    response.message ||
                    'Customer creation failed'
                );

                return;
            }


            alert(
                'Customer registered successfully!'
            );


            setShowModal(false);


            /*
             * Reload customer list
             */

            await loadCustomers();


        } catch (error) {

            console.error(
                'Customer creation failed:',
                error
            );

            alert(
                error?.message ||
                'Failed to register customer'
            );

        }

    };


    // =========================
    // VIEW CUSTOMER
    // =========================

    const handleView = (customer) => {

        alert(
            `Customer Details\n\n` +
            `Customer ID: ${customer.customerId}\n` +
            `Name: ${customer.fullName}\n` +
            `Phone: ${customer.phoneNumber}\n` +
            `Date of Birth: ${customer.dateOfBirth || '-'}\n` +
            `Email: ${customer.email || '-'}\n` +
            `Status: ${
                customer.isArchived
                    ? 'ARCHIVED'
                    : 'ACTIVE'
            }`
        );

    };


    // =========================
    // EDIT CUSTOMER
    // =========================

    const handleEdit = (customer) => {

        alert(
            `Edit Customer\n\n` +
            `Customer ID: ${customer.customerId}\n` +
            `Name: ${customer.fullName}`
        );

    };


    // =========================
    // DELETE / ARCHIVE CUSTOMER
    // =========================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                'Are you sure you want to archive this customer?'
            );

        if (!confirmDelete) {

            return;

        }


        try {

            const response =
                await customerService.delete(id);

            console.log(
                'Delete Response:',
                response
            );


            if (response?.success === false) {

                alert(
                    response.message ||
                    'Failed to archive customer'
                );

                return;
            }


            alert(
                'Customer archived successfully!'
            );


            /*
             * Reload list after deletion
             */

            await loadCustomers();


        } catch (error) {

            console.error(
                'Delete failed:',
                error
            );

            alert(
                error?.message ||
                'Failed to archive customer'
            );

        }

    };


    return (

        <div>


            {/* =========================
                HEADER
            ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h3 className="fw-bold">
                    Customer Directory
                </h3>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddCustomer}
                >
                    + Add Customer
                </button>

            </div>


            {/* =========================
                SEARCH
            ========================= */}

            <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search customers..."
            />


            {/* =========================
                CUSTOMER TABLE
            ========================= */}

            <CustomerTable
                customers={customers}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />


            {/* =========================
                PAGINATION
            ========================= */}

            <Pagination
                page={0}
                totalPages={1}
                onPageChange={() => {}}
            />


            {/* =========================
                ADD CUSTOMER MODAL
            ========================= */}

            <AddCustomerModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveCustomer}
            />

        </div>

    );

}