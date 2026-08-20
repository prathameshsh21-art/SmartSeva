import React, { useState } from 'react';

export default function AddCustomerModal({
    show,
    onClose,
    onSave
}) {

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        dateOfBirth: '',
        email: ''
    });


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        console.log(
            'Sending Customer:',
            formData
        );

        await onSave(formData);

        setFormData({
            fullName: '',
            phoneNumber: '',
            dateOfBirth: '',
            email: ''
        });

    };


    if (!show) {
        return null;
    }


    return (

        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: 'rgba(0,0,0,0.5)'
            }}
        >

            <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content">


                    <div className="modal-header">

                        <h5 className="modal-title fw-bold">
                            Register New Customer
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="modal-body">


                            <div className="mb-3">

                                <label className="form-label small fw-semibold">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-control"
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="mb-3">

                                <label className="form-label small fw-semibold">
                                    Mobile Number
                                </label>

                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    className="form-control"
                                    placeholder="10-digit phone number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    required
                                />

                            </div>


                            <div className="mb-3">

                                <label className="form-label small fw-semibold">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    className="form-control"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="mb-3">

                                <label className="form-label small fw-semibold">
                                    Email (Optional)
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="email@domain.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Save Customer
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

}