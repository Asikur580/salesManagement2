<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('proprietor_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        $paginated = $query->latest()->paginate($perPage)->withQueryString();

        $suppliers = [
            'data' => collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'companyName' => $item->company_name,
                    'proprietorName' => $item->proprietor_name,
                    'phone' => $item->phone,
                    'whatsapp' => $item->whatsapp,
                    'email' => $item->email,
                    'address' => $item->address,
                    'country' => $item->country,
                    'image' => $item->image,
                    'status' => $item->status,
                ];
            }),
            'links' => $paginated->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'from' => $paginated->firstItem(),
                'last_page' => $paginated->lastPage(),
                'path' => $paginated->path(),
                'per_page' => $paginated->perPage(),
                'to' => $paginated->lastItem(),
                'total' => $paginated->total(),
            ]
        ];

        return Inertia::render('Suppliers', [
            'initialSuppliers' => $suppliers,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'proprietor_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'required|email|max:255|unique:suppliers,email',
            'address' => 'required|string',
            'country' => 'required|string|max:100',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|string',
        ]);

        $imagePath = $this->handleImageUpload($request->image);

        Supplier::create([
            'company_name' => $request->company_name,
            'proprietor_name' => $request->proprietor_name,
            'phone' => $request->phone,
            'whatsapp' => $request->whatsapp,
            'email' => $request->email,
            'address' => $request->address,
            'country' => $request->country,
            'status' => $request->status,
            'image' => $imagePath
        ]);

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'company_name' => 'required|string|max:255',
            'proprietor_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'required|email|max:255|unique:suppliers,email,' . $id,
            'address' => 'required|string',
            'country' => 'required|string|max:100',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|string',
        ]);

        $data = $request->only(['company_name', 'proprietor_name', 'phone', 'whatsapp', 'email', 'address', 'country', 'status']);

        if ($request->filled('image')) {
            $data['image'] = $this->handleImageUpload($request->image, $supplier->image);
        }

        $supplier->update($data);

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        if ($supplier->image && \Illuminate\Support\Facades\Storage::disk('public')->exists($supplier->image)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($supplier->image);
        }

        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);

        return Inertia::render('SupplierView', [
            'id' => (string)$id,
            'initialSupplier' => [
                'id' => $supplier->id,
                'companyName' => $supplier->company_name,
                'proprietorName' => $supplier->proprietor_name,
                'phone' => $supplier->phone,
                'whatsapp' => $supplier->whatsapp,
                'email' => $supplier->email,
                'address' => $supplier->address,
                'country' => $supplier->country,
                'image' => $supplier->image,
                'status' => $supplier->status,
            ]
        ]);
    }

    private function handleImageUpload($base64Image, $oldImage = null)
    {
        if (!$base64Image || !preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            return $oldImage;
        }

        $image = substr($base64Image, strpos($base64Image, ',') + 1);
        $type = strtolower($type[1]);

        if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
            return $oldImage;
        }

        $image = str_replace(' ', '+', $image);
        $image = base64_decode($image);

        if ($oldImage && \Illuminate\Support\Facades\Storage::disk('public')->exists($oldImage)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldImage);
        }

        $imageName = 'supplier_' . time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $type;
        \Illuminate\Support\Facades\Storage::disk('public')->put('suppliers/' . $imageName, $image);

        return 'suppliers/' . $imageName;
    }
}
