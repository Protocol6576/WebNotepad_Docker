<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\File;

class NotesController extends Controller
{
    // Storage::disk('public')->

    public function getTitles() {
        $path = ('allNotes');
        $filesInFolder = Storage::disk('public')->directories($path);
    
        foreach($filesInFolder as $key => $path){
            $files = pathinfo($path);
            $NotesList[] = array(
                "rank" => "|",
                "title" => $files['filename']
            );
        }
    
        return $NotesList;
    }
    
    public function redactContent($note_name, $note_Text) {
        $path = ('allNotes/'.$note_name.'/note.txt');
        $date_time = date('m.d.Y h-i-s a', time());
        $new_path = ('allNotes/'.$note_name.'/previous'.'/'.$date_time.'.txt');

        Storage::disk('public')->copy($path, $new_path);
        Storage::disk('public')->put($path, $note_Text);

        $this->prependLogs('1.1.1.1', $note_name, 'Редактирование файла');
        return true; //Файл изменен
    }
    
    public function showContent($note_name) {
        $path = ('allNotes/'.$note_name.'/note.txt');
        $note_Text = Storage::disk('public')->get($path);

        //$this->prependLogs('1.1.1.1', $note_name, 'Просмотр файла');
        return $note_Text;
    }
    
    public function rename($note_name, $new_note_name) {
        $path = ('allNotes/'.$note_name);
        $new_path = ('allNotes/'.$new_note_name);
        Storage::disk('public')->move($path, $new_path);

        $this->prependLogs('1.1.1.1', $new_note_name, 'Переименовывание файла в '.$new_note_name);
        return true; //Файл переименован
    }
    
    public function create($note_name) {
        $path = ('allNotes/'.$note_name);
        if (Storage::disk('public')->exists($path)) {
            return false; //Файл уже существует
        } else {
            Storage::disk('public')->makeDirectory($path);
            Storage::disk('public')->makeDirectory($path.'/previous');
            
            $path = ('allNotes/'.$note_name.'/note.txt');
            Storage::disk('public')->put($path, "Я родился!");

            $path = ('allNotes/'.$note_name.'/note.log');
            Storage::disk('public')->put($path, "");

            $this->prependLogs('1.1.1.1', $note_name, 'Создание файла');
            return true; //Файл создан
        }
    }
    
    public function delete($note_name) {
        $path = ('allNotes/'.$note_name);
        //$this->prependLogs('1.1.1.1', $note_name, 'Удаление файла');
        Storage::disk('public')->deleteDirectory($path);

        return true; //Файл удален
    }

    public function prependLogs($ip_user, $note_name, $info) {
        $date_time = date('m/d/Y h:i:s a', time());
        //$ip_user = '1.1.1.1:0001';
        $path = ('allNotes/'.$note_name.'/note.log');
        Storage::disk('public')->prepend($path, '['.$date_time.']'.' '.$ip_user.' '.$note_name.': '.$info);

        return true;
    }
}
