<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Technician;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TechnicianController extends Controller
{
    public function index()
    {
        $technicians = Technician::latest()->get();
        return Inertia::render('Technicians', [
            'technicians' => $technicians
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
        ]);

        Technician::create($request->all());

        return redirect()->back()->with('message', 'Technician created successfully');
    }

    public function update(Request $request, $id)
    {
        $technician = Technician::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
        ]);

        $technician->update($request->all());

        return redirect()->back()->with('message', 'Technician updated successfully');
    }

    public function destroy($id)
    {
        $technician = Technician::findOrFail($id);
        $technician->delete();

        return redirect()->back()->with('message', 'Technician deleted successfully');
    }
}
