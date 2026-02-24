import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  id: number;
  name: string;
  packSize: string;
  salePrice: number;
  flatPrice: number;
}

export interface OrderItem {
  id: string; // React key
  dbId?: number; // Backend ID
  productId: number | null;
  productName: string;
  customItemName?: string;
  packSize: string;
  priceType: "tp" | "flat";
  price: number;
  quantity: number;
  bonusQuantity: number;
  total: number;
}

interface OrderItemRowProps {
  item: OrderItem;
  products: Product[];
  onUpdate: (id: string, updates: Partial<OrderItem>) => void;
  onRemove: (id: string) => void;
}

export const OrderItemRow = ({ item, products, onUpdate, onRemove }: OrderItemRowProps) => {
  const [productOpen, setProductOpen] = useState(false);

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === parseInt(productId));
    if (product) {
      const price = item.priceType === "tp" ? product.salePrice : product.flatPrice;
      onUpdate(item.id, {
        productId: product.id,
        productName: product.name,
        customItemName: undefined,
        packSize: product.packSize,
        price,
        total: price * item.quantity,
      });
    }
  };

  const handleCustomNameChange = (value: string) => {
    onUpdate(item.id, {
      productId: null,
      productName: value,
      customItemName: value,
      packSize: "N/A",
    });
  };

  const handlePriceTypeChange = (priceType: "tp" | "flat") => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const price = priceType === "tp" ? product.salePrice : product.flatPrice;
      onUpdate(item.id, {
        priceType,
        price,
        total: price * item.quantity,
      });
    } else {
      onUpdate(item.id, { priceType });
    }
  };

  const handlePriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    onUpdate(item.id, {
      price,
      total: price * item.quantity,
    });
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    onUpdate(item.id, {
      quantity,
      total: item.price * quantity,
    });
  };

  const handleBonusChange = (value: string) => {
    const bonusQuantity = parseInt(value) || 0;
    onUpdate(item.id, { bonusQuantity });
  };

  const selectedProduct = products.find((p) => p.id === item.productId);

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-border">
      <div className="col-span-3">
        <Popover open={productOpen} onOpenChange={setProductOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={productOpen}
              className="h-9 w-full justify-between font-normal"
            >
              <span className="truncate">
                {item.productId ? `${item.productName} (${item.packSize})` : (item.customItemName || "Select or enter product")}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search or enter custom name..." 
                onValueChange={(val) => {
                    // This is a bit tricky with Command, usually we want to allow enter to select custom
                }}
              />
              <CommandList>
                <CommandEmpty>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start font-normal"
                    onClick={() => {
                        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                        handleCustomNameChange(input?.value || "Custom Item");
                        setProductOpen(false);
                    }}
                  >
                    Add custom item
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.name} ${product.packSize}`}
                      onSelect={() => {
                        handleProductChange(product.id.toString());
                        setProductOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          item.productId === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {product.name} ({product.packSize})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="col-span-1 text-center text-sm text-muted-foreground">
        {item.packSize || "-"}
      </div>
      <div className="col-span-2">
        <Select
          value={item.priceType}
          onValueChange={(v) => handlePriceTypeChange(v as "tp" | "flat")}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tp">TP</SelectItem>
            <SelectItem value="flat">Flat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          value={item.price || ""}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="h-9"
          placeholder="Price"
        />
      </div>
      <div className="col-span-1">
        <Input
          type="number"
          value={item.quantity || ""}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className="h-9"
          placeholder="Qty"
          min={1}
        />
      </div>
      <div className="col-span-1">
        <Input
          type="number"
          value={item.bonusQuantity || ""}
          onChange={(e) => handleBonusChange(e.target.value)}
          className="h-9"
          placeholder="Bonus"
          min={0}
        />
      </div>
      <div className="col-span-1 text-right font-medium">
        ৳{item.total.toFixed(2)}
      </div>
      <div className="col-span-1 text-right">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
