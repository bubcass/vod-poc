export type VodHubView = "NOW" | "DEMAND" | "TV" | "MY";

function getBaseHref() {
  return import.meta.env.BASE_URL || "/";
}

export function buildVodHubHref(view: VodHubView) {
  const params = new URLSearchParams();

  if (view !== "NOW") {
    params.set("view", view.toLowerCase());
  }

  const query = params.toString();
  return `${getBaseHref()}${query ? `?${query}` : ""}`;
}

export function buildVodHolderHref(itemId: string) {
  const params = new URLSearchParams();
  params.set("prototype", "holder");
  params.set("item", itemId);
  return `${getBaseHref()}?${params.toString()}`;
}
