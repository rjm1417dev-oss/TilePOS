<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TileStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'exists:brands,id'],
            'size_id' => ['required', 'exists:sizes,id'],
            'tile_code' => ['nullable', 'string', 'max:100'],
            'packing_m2' => ['nullable', 'numeric', 'min:0'],
            'no_of_tiles_per_box' => ['nullable', 'integer', 'min:0'],
            'cost_per_m2' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }
}
