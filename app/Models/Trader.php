<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trader extends Model
{
    use HasFactory;

    protected $primaryKey = 'TraderID';

    protected $fillable = [
        'TraderName',
        'Phone',
        'Address',
        'IsActive'
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class, 'TraderID');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'TraderID');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'TraderID');
    }
}