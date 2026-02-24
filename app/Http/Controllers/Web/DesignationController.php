<?php

namespace App\Http\Controllers\Web;

use Throwable;
use Inertia\Inertia;
use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;

class DesignationController extends Controller
{
    public function index(Request $request)
    {
        $query = Designation::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 10);

        $paginated = $query->latest()->paginate($perPage)->withQueryString();

        $designations = [
            'data' => collect($paginated->items())->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'createdAt' => $item->created_at,
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

        return Inertia::render('Designations', [
            'initialDesignations' => $designations,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $data = $request->only(['name', 'description', 'status']);

            if (!$request->has('status')) {
                $data['status'] = 'active';
            }

            // Handle ghost columns
            if (Schema::hasColumn('designations', 'company_id')) {
                $data['company_id'] = 1; // Default fallback
            }

            Designation::create($data);

            DB::commit();

            return redirect()->back()->with('success', 'Designation created successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create designation: ' . $th->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $designation = Designation::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $data = $request->only(['name', 'description', 'status']);

            // Handle ghost columns
            if (Schema::hasColumn('designations', 'company_id') && !$designation->company_id) {
                $data['company_id'] = 1; // Default fallback
            }

            $designation->update($data);

            DB::commit();

            return redirect()->back()->with('success', 'Designation updated successfully.');
        } catch (Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update designation: ' . $th->getMessage());
        }
    }

    public function destroy($id)
    {
        $designation = Designation::findOrFail($id);
        $designation->delete();

        return redirect()->back()->with('success', 'Designation deleted successfully.');
    }
}
