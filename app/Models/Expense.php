<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $table = 'expenses';
    protected $primaryKey = 'ExpenseID';
    protected $fillable = [
        'ExpenseDate',
        'Description',
        'Amount'
    ];

    protected $casts = [
        'ExpenseDate' => 'date',
        'Amount' => 'decimal:2'
    ];
}