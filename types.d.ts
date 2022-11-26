export type Page = {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: "page";
  _updatedAt: string;
  body: string;
  slug: {
    _type: "slug";
    current: string;
  };
  title: string;
};
