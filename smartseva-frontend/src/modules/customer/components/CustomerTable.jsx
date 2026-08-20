import React from 'react';

import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function CustomerTable({
    customers = [],
    onView,
    onEdit,
    onDelete
}) {

    const columns = [

        {
            key: 'customerId',
            label: 'Customer ID'
        },

        {
            key: 'fullName',
            label: 'Full Name'
        },

        {
            key: 'phoneNumber',
            label: 'Phone Number'
        },

        {
            key: 'email',
            label: 'Email'
        },

        {
            key: 'status',
            label: 'Status'
        },

        {
            key: 'actions',
            label: 'Actions'
        }

    ];


    const tableData = customers.map((customer) => ({

        customerId: customer.customerId,

        fullName: customer.fullName,

        phoneNumber: customer.phoneNumber,

        email: customer.email || '-',

        status: (
            <StatusBadge
                status={
                    customer.isArchived
                        ? 'ARCHIVED'
                        : 'ACTIVE'
                }
            />
        ),

        actions: (

            <div className="d-flex gap-2">

                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onView(customer)}
                >
                    View
                </button>


                <button
                    type="button"
                    className="btn btn-sm btn-outline-success"
                    onClick={() => onEdit(customer)}
                >
                    Edit
                </button>


                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                        onDelete(customer.customerId)
                    }
                >
                    Delete
                </button>

            </div>

        )

    }));


    return (

        <DataTable
            columns={columns}
            data={tableData}
        />

    );

}