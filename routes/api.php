<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\NotesHistoryController;
use App\Http\Controllers\EnvController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
}); // зОчем он нужон? Разобраться! ._.



Route::middleware(['exists'])->prefix('note')->controller(NotesController::class)->group(function () {

    Route::get('/getTitles', 'getTitles')->withoutMiddleware(['exists']);

    Route::get('/redactContent/{noteName}/{noteText}', 'redactContent');

    Route::get('/showContent/{noteName}', 'showContent');

    Route::get('/rename/{noteName}/{newNoteName}', 'rename');

    Route::get('/create/{noteName}', 'create');

    Route::get('/delete/{noteName}', 'delete');
});

Route::middleware(['history'])->prefix('note/history')->controller(NotesHistoryController::class)->group(function () {

    Route::get('/getTitles/{noteName}', 'getTitles');

    Route::get('/showContent/{noteName}/{historyName}', 'showContent');
});

Route::prefix('env')->group(function () {

    Route::get('/getData/{jsonRequiresSettings}', [EnvController::class, 'getData']);

    Route::get('/editData/{jsonSettings}', [EnvController::class, 'editData']);
});