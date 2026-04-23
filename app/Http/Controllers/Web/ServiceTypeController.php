<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceTypeController extends Controller
{
    public function index()
    {
        $serviceTypes = ServiceType::orderBy('name')->get();
        return Inertia::render('Service/Types', [
            'serviceTypes' => $serviceTypes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:service_types,name',
            'charge' => 'required|numeric|min:0',
        ]);

        ServiceType::create($request->only('name', 'charge'));
        return redirect()->back()->with('success', 'Service Type created successfully.');
    }

    public function update(Request $request, ServiceType $serviceType)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:service_types,name,' . $serviceType->id,
            'charge' => 'required|numeric|min:0',
        ]);

        $serviceType->update($request->only('name', 'charge'));
        return redirect()->back()->with('success', 'Service Type updated successfully.');
    }

    public function destroy(ServiceType $serviceType)
    {
        $serviceType->delete();
        return redirect()->back()->with('success', 'Service Type deleted successfully.');
    }
}
