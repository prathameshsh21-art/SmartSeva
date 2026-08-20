import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function ServiceTable({
  services = [],
  onView,
  onStatus,
}) {

  const columns = [
    { key: 'serviceId', label: 'Service ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'serviceName', label: 'Service' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = services.map((service) => ({
    serviceId: service.serviceId,
    customer: service.customerName,
    serviceName: service.serviceName,

    status: (
      <StatusBadge
        status={service.status}
      />
    ),

    actions: (
      <div className="d-flex gap-2">

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onView?.(service)}
        >
          View
        </button>

        <button
          className="btn btn-sm btn-outline-warning"
          onClick={() => onStatus?.(service)}
        >
          Update
        </button>

      </div>
    ),
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}