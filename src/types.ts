export interface Profile {
  id: string;
  name: string;
  age: number;
  position: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProfileFormData {
  name: string;
  age: string;
  position: string;
  image: File | null;
}
