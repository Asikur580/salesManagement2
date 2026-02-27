import { useState, useRef, useEffect } from "react";
import { X, UploadCloud, Star, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageFile {
    file?: File;
    preview: string;
    isPrimary: boolean;
    id?: number; // for existing images
}

interface ProductImageUploaderProps {
    images: ImageFile[];
    onChange: (images: ImageFile[]) => void;
    maxFiles?: number;
}

export function ProductImageUploader({
    images,
    onChange,
    maxFiles = 5,
}: ProductImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Clean up object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            images.forEach((img) => {
                if (img.file && img.preview.startsWith("blob:")) {
                    URL.revokeObjectURL(img.preview);
                }
            });
        };
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        if (images.length + newFiles.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        const newImageObjs: ImageFile[] = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            isPrimary: images.length === 0 && newFiles[0] === file, // first image is primary initially
        }));

        onChange([...images, ...newImageObjs]);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        const removed = newImages.splice(index, 1)[0];

        if (removed.file && removed.preview.startsWith("blob:")) {
            URL.revokeObjectURL(removed.preview);
        }

        // If we removed the primary, make the first remaining image primary
        if (removed.isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }

        onChange(newImages);
    };

    const setPrimary = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        // Move primary to front
        const primaryImg = newImages.splice(index, 1)[0];
        newImages.unshift(primaryImg);

        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer ${images.length >= maxFiles ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileSelect}
                />
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                    <UploadCloud className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                    Click to upload images
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG or WEBP (max {maxFiles} images)
                </p>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative group rounded-md border overflow-hidden bg-white aspect-square flex items-center justify-center"
                        >
                            <img
                                src={img.preview}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover"
                            />

                            {img.isPrimary && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-900" />{" "}
                                    Primary
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="bg-white/90 hover:bg-white text-red-600 rounded-full p-1.5 shadow"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                {!img.isPrimary && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="w-full text-xs h-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPrimary(index);
                                        }}
                                    >
                                        Set Primary
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
