<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::latest()->get();
        return Inertia::render('Services', [
            'services' => $services
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'standard_charge' => 'required|numeric|min:0',
        ]);

        Service::create($request->all());

        return redirect()->back()->with('message', 'Service created successfully');
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'standard_charge' => 'required|numeric|min:0',
        ]);

        $service->update($request->all());

        return redirect()->back()->with('message', 'Service updated successfully');
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return redirect()->back()->with('message', 'Service deleted successfully');
    }
}
