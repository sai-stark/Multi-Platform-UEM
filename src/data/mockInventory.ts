import { InventoryDevice } from "@/types/models";

export const mockInventory: InventoryDevice[] = [
    {
        id: "1",
        serialNumber: "SN-1001",
        manufacturer: "Dell",
        modelNumber: "Latitude 5420",
        location: "New York Office",
        assetTag: "AST-001",
        assignedUser: "John Doe",
        userEmail: "john.doe@example.com"
    },
    {
        id: "2",
        serialNumber: "SN-1002",
        manufacturer: "Apple",
        modelNumber: "MacBook Pro 14",
        location: "San Francisco HQ",
        assetTag: "AST-002",
        assignedUser: "Jane Smith",
        userEmail: "jane.smith@example.com"
    },
    {
        id: "3",
        serialNumber: "SN-1003",
        manufacturer: "Lenovo",
        modelNumber: "ThinkPad X1 Carbon",
        location: "London Branch",
        assetTag: "AST-003",
        assignedUser: "Robert Brown",
        userEmail: "robert.brown@example.com"
    },
    {
        id: "4",
        serialNumber: "SN-1004",
        manufacturer: "Apple",
        modelNumber: "iPad Pro 12.9",
        location: "Remote",
        assetTag: "AST-004",
        assignedUser: "Emily White",
        userEmail: "emily.white@example.com"
    },
    {
        id: "5",
        serialNumber: "SN-1005",
        manufacturer: "Samsung",
        modelNumber: "Galaxy Tab S9",
        location: "Warehouse",
        assetTag: "AST-005",
        assignedUser: undefined, // Unassigned
        userEmail: undefined
    },
    {
        id: "6",
        serialNumber: "SN-1006",
        manufacturer: "Dell",
        modelNumber: "OptiPlex 7090",
        location: "New York Office",
        assetTag: "AST-006",
        assignedUser: "Michael Green",
        userEmail: "michael.green@example.com"
    }
];
