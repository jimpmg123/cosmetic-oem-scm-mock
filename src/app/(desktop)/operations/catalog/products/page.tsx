import { redirect } from "next/navigation";

export default function CatalogProductsRedirect() {
  redirect("/operations/catalog");
}
