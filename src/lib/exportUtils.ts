import * as XLSX from "xlsx";
import { Entry } from "@/types";

export function exportToCsv(data: Entry[], filename = "KDU_Tea_Factory_Data") {
  if (!data || data.length === 0) {
    alert("අපනයනය කිරීමට දත්ත නොමැත (No data to export)");
    return;
  }

  const headers = [
    "ID",
    "Record Type",
    "Date",
    "Time",
    "Extension Officer ID",
    "Factory",
    "Route",
    "Supplier No",
    "Supplier Name",
    "NIC",
    "Phone Number",
    "Will Give Leaves?",
    "Reason / Status",
    "Could Not Meet",
    "Actions Taken",
    "Permanent Worker",
    "Worker Gender",
    "Worker Birth Year",
    "Daily Wages (LKR)",
    "Temp Workers Count",
    "Sales Volume (Kg)",
    "Sales Volume Date",
    "Supplier Type",
    "Address",
    "Expected Leaf (Kg)",
    "Suggestions",
    "Route Problems",
    "Comments",
    "GPS Location",
    "GPS Accuracy",
    "Dynamic Survey JSON"
  ];

  const rows = data.map((item) => [
    item.id,
    item.type === "inactive" ? "Inactive Supplier" : "Extension Visit",
    item.date,
    item.time,
    item.collectorId,
    item.factory || "",
    item.route || "",
    item.supplierNo || "",
    item.supplierName || "",
    item.nic || "",
    item.phoneNumber || "",
    item.willGive || "",
    item.promiseReason || "",
    item.couldNotMeet ? "Yes" : "No",
    item.actionsTaken ? `"${item.actionsTaken.replace(/"/g, '""')}"` : "",
    item.permWorkerName || "",
    item.permWorkerGender || "",
    item.permWorkerBirthYear || "",
    item.permWorkerWages || "",
    item.tempWorkersCount || "",
    item.salesVolumeKg || "",
    item.salesVolumeDate || "",
    item.supplierType || "",
    item.address ? `"${item.address.replace(/"/g, '""')}"` : "",
    item.expectedLeafQty || "",
    item.suggestions ? `"${item.suggestions.replace(/"/g, '""')}"` : "",
    item.routeProblems ? `"${item.routeProblems.replace(/"/g, '""')}"` : "",
    item.comments ? `"${item.comments.replace(/"/g, '""')}"` : "",
    item.gpsLocation || "",
    item.gpsAccuracy || (item.gpsLocation ? "precise" : ""),
    item.customFieldsJson ? `"${item.customFieldsJson.replace(/"/g, '""')}"` : ""
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: Entry[], filename = "KDU_Tea_Factory_Data") {
  if (!data || data.length === 0) {
    alert("අපනයනය කිරීමට දත්ත නොමැත (No data to export)");
    return;
  }

  const excelRows = data.map((item) => ({
    "ID": item.id,
    "Record Type": item.type === "inactive" ? "Inactive Supplier" : "Extension Visit",
    "Date": item.date,
    "Time": item.time,
    "Extension Officer ID": item.collectorId,
    "Factory": item.factory || "",
    "Route": item.route || "",
    "Supplier No": item.supplierNo || "",
    "Supplier Name": item.supplierName || "",
    "NIC": item.nic || "",
    "Phone Number": item.phoneNumber || "",
    "Will Give Leaves?": item.willGive || "",
    "Reason / Status": item.promiseReason || "",
    "Could Not Meet": item.couldNotMeet ? "Yes" : "No",
    "Actions Taken": item.actionsTaken || "",
    "Perm Worker": item.permWorkerName || "",
    "Worker Gender": item.permWorkerGender || "",
    "Worker Birth Year": item.permWorkerBirthYear || "",
    "Daily Wages (LKR)": item.permWorkerWages || "",
    "Temp Workers Count": item.tempWorkersCount || "",
    "Sales Volume (Kg)": item.salesVolumeKg || "",
    "Sales Volume Date": item.salesVolumeDate || "",
    "Supplier Type": item.supplierType || "",
    "Address": item.address || "",
    "Expected Leaf (Kg)": item.expectedLeafQty || "",
    "Suggestions / Feedback": item.suggestions || "",
    "Route Problems": item.routeProblems || "",
    "Field Observations": item.comments || "",
    "GPS Location": item.gpsLocation || "",
    "GPS Accuracy": item.gpsAccuracy || (item.gpsLocation ? "precise" : ""),
    "Custom Survey Fields": item.customFieldsJson || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // Set nice column widths
  const colWidths = Object.keys(excelRows[0] || {}).map((k) => ({
    wch: Math.max(k.length, 14)
  }));
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  // Sheet tab name mirrors the exported record type (Excel limit: 31 chars)
  const sheetName =
    filename.replace(/[^A-Za-z0-9_ ]/g, " ").trim().slice(0, 31) || "KDU Field Data";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${filename}_${dateStr}.xlsx`);
}
