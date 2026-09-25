import api from "./api";

export async function getProductionReport(startDateFrom, startDateTo) {
  const res = await api.get("/api/ProductionRecord/GetProductionReport", {
    params: { startDateFrom, startDateTo },
  });
  return res.data;
}
