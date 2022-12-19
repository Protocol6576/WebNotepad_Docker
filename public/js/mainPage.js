//#region ** Глобальные переменные **
let settings = {
    NOTE_MAX_LENGTH: 999,
    LOG_MAX_SIZE: 999,
};
var autosave_timerId = 1;
var autosave_eventId = 1;
var current_note_History = ''; // Нужна для запоминания названия заметки при переходе между элементами (Список заметок и жлемент истории)

//#endregion



//#region *** Функции по обращению к серверу ***

    //#region *** Функции для работы с настрйоками ***

function getEnvData() {
    var jsonSettings = JSON.stringify(settings);
    webix.ajax().get('api/env/getData/' + jsonSettings).then(function(data) {
        data = data.json();
        settings = data;
        setEnvData();
    });
};

function editEnvData() {

    let jsonSettings = JSON.stringify(settings);
    var reqResult = webix.ajax().get('api/env/editData/' + jsonSettings);
    setEnvData();

    if(reqResult) {
        webix.message('Настройки изменены');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
};

//#endregion

    //#region *** Функции для работы с заметками ***

function loadNoteHistoryList(noteName) {
    $$("NotesHistoryList").clearAll();
    $$("NotesHistoryList").load(function() {
        return webix.ajax().get('api/note/history/getTitles/' + noteName);
    });
}

function showHistoryContent(noteName, historyName) { // ToDo: Повторяется код с showNoteContent, попробовать объеденить
    $$("NoteTextArea").disable();
    $$("NoteTextArea").setValue(' ');

    $$("NoteTextArea").showProgress({
        type: "icon",
        delay: 500,
        hide: true
    });

    webix.ajax().get('api/note/history/showContent/' + noteName + '/' + historyName).then(function(data) {
        data = data.text();

        $$("NoteTextArea").setValue(data);
        $$("NoteTextArea").enable();
        $$("NoteTextArea").focus();
    });

}

function loadNoteList() {
    $$("NotesList").clearAll();
    $$("NotesList").load(function() {
        return webix.ajax().get('api/note/getTitles');
    });
    disableTextarea();
}

function redactNoteContent(noteName, newText) {
    var reqResult = webix.ajax().get('api/note/redactContent/' + noteName + '/' + newText);

    if(reqResult) {
        webix.message('Текст заметки изменен');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }

}

function showNoteContent(noteName) {
    $$("NoteTextArea").disable();
    $$("NoteTextArea").setValue(' ');

    $$("NoteTextArea").showProgress({
        type: "icon",
        delay: 500,
        hide: true
    });

    webix.ajax().get('api/note/showContent/' + noteName).then(function(data) {
        data = data.text();

        $$("NoteTextArea").setValue(data);
        $$("NoteTextArea").enable();
        $$("NoteTextArea").focus();
    });

}

function renameNote(noteName, newNoteName, noteId) {
    var reqResult = webix.ajax().get('api/note/rename/' + noteName + '/' + newNoteName);

    if(reqResult) {
        var renameNote = $$("NotesList").getItem(noteId);
        renameNote.title = newNoteName;
        $$("NotesList").updateItem(noteId, renameNote);

        webix.message('Заметка переименована');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function createNote(newNoteName) {
    var reqResult = webix.ajax().get('api/note/create/' + newNoteName);

    if(reqResult) {
        let newNote = {
            rank: "|",
            title: newNoteName
        };
        $$("NotesList").add(newNote);
        webix.message('Заметка создана');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

function deleteNote(noteName, noteId) {
    var reqResult = webix.ajax().get('api/note/delete/' + noteName).then(function(data) {
        data = data.json();
    });

    if(reqResult) {
        $$("NotesList").remove(noteId);
        webix.message('Заметка удалена');
    } else {
        webix.message('Произошла ошибка, повторите позже');
    }
}

//#endregion

//#endregion

//#region *** Остальные функции ***

function disableTextarea() {
    var notesCount = $$("NotesList").count();

    $$("NoteTextArea").disable();
    if(notesCount == 0) {
        $$("NoteTextArea").setValue('Создайте заметку');
    } else {
        $$("NoteTextArea").setValue('Выберите заметку');
    }
}

function autosave_set(autosave_value) {
    if(autosave_value) {
        autosave_eventId = $$("NoteTextArea").attachEvent("onKeyPress", function() {
            clearTimeout(autosave_timerId);
            var itemId = $$("NotesList").getSelectedItem().title;
            var newText = $$("NoteTextArea").getValue();
    
            autosave_timerId = setTimeout(redactNoteContent, 3000, itemId, newText);
        });
    } else {
        $$("NoteTextArea").detachEvent(autosave_eventId);
    }
}

function setEnvData() {
    $$("NoteTextArea").define("attributes", { maxlength: settings.NOTE_MAX_LENGTH });
    $$("NoteTextArea").refresh();

    $$('note_max_length').setValue(settings.NOTE_MAX_LENGTH);
    $$('log_max_size').setValue(settings.LOG_MAX_SIZE);
}

function updateSettings(note_max_length, log_max_size) {
    settings.NOTE_MAX_LENGTH = note_max_length;
    settings.LOG_MAX_SIZE = log_max_size;
}

//#endregion





webix.ready(function() {
    // Основной вшений вид
    webix.ui({
        rows: [
            {
                cols: [
                    {
                        id: 'menuViews',
                        width: 300, // Nutrientibus off tractor driver

                        cells : [
                            {
                                // Элемент со списком заметок
                                type: 'clean',
                                id: 'mainMenu',

                                rows: [
                                    {
                                        view:"toolbar",
                                        id:"mainToolbar",
                                        height: 40,
                                        type: 'clean',

                                        cols: [
                                            {
                                                view: 'icon',
                                                icon: 'wxi-dots',
                                                click: function(){
                                                    if( $$("menu").config.hidden) {
                                                        $$("menu").show();
                                                    } else {
                                                        $$("menu").hide();
                                                    }
                                                }
                                            },
                                            {
                                                view:'search',
                                                id: 'NotesList_input',

                                                placeholder: 'Найти...',
                                            }
                                        ]
                                    },
                                    {
                                        view: 'list',
                                        id: 'NotesList',
                                        data: ' ', // НЕ УДАЛЯТЬ! Иначе не произайдет прогрузки

                                        select: true,
                                        drag: true,
                                        scroll: 'auto',
                                        template:"#title#",

                                        onContext:{}, // Позволяет использовать свое контекстное меню
                                    },

                                ]
                            },
                            {
                                // Элемент с настройками
                                type: 'line',
                                id: 'settingsMenu',

                                rows: [
                                    {
                                        view:"toolbar",
                                        id:"settingsToolbar",
                                        height: 40,
                                        type: 'clean',

                                        cols: [
                                            {
                                                view: 'icon',
                                                icon: 'wxi-angle-left',
                                                click: function(){
                                                    $$("menuViews").back();
                                                }
                                            },
                                            {
                                                view: 'label',
                                                label: 'Настройки',
                                            },
                                            {
                                                view: 'icon',
                                                icon: 'wxi-check',
                                                click: function(){
                                                    var note_max_length = $$('note_max_length').getValue();
                                                    var log_max_size = $$('log_max_size').getValue();

                                                    updateSettings(note_max_length, log_max_size);
                                                    editEnvData();
                                                }
                                            },
                                        ]
                                    },
                                    {
                                        view: 'form',
                                        id: 'settings_form',
                                        elements: [
                                            {
                                                view: 'counter',
                                                id: 'note_max_length',
                                                label: 'Длина заметки',
                                                format: '1,111',
                                                labelWidth: 155,
                                                name: 'note_max_length',
                                                value: 1,
                                                min: 1,
                                                max: 9999,
                                            },
                                            {
                                                view: 'counter',
                                                id: 'log_max_size',
                                                label: 'Размер логов',
                                                format: '1,111',
                                                labelWidth: 155,
                                                name: 'log_max_size',
                                                value: 1,
                                                min: 1,
                                                max: 999,
                                            },
                                            {

                                            },
                                            {

                                            }
                                        ]
                                    },

                                ]
                            }
                        ],
                        
                    },
                    {
                        // Текстовое поле справа
                        rows: [
                            {
                                view:"toolbar",
                                id:"currNoteToolbar",
                                height: 40,


                                cols: [
                                    {
                                        
                                    },
                                    {
                                      view: 'checkbox',
                                      id: 'autosave_checkbox',
                                      label: 'Автосохранение',
                                      value: '0',
                                      labelWidth: 120,
                                      width: 150
                                    },
                                    {
                                        // Загрузить данные
                                        view: 'icon',
                                        icon: 'wxi-file',
                                        click: function() {
                                            var itemId = $$("NotesList").getSelectedItem().title;
                                            var newText = $$("NoteTextArea").getValue();
                                            redactNoteContent(itemId, newText);
                                        },
                                    }
                                ]
                                
                            },
                            {
                                view: 'textarea',
                                id: 'NoteTextArea',
                                placeholder: 'Напишите что-то здесь',

                                attributes: {
                                    maxlength: 1,
                                },
                                
                                css: {
                                    'border': 'none !important',
                                    'outline': 'none !important',
                                }
                            },                        
                        ]


                        
                    }
                ]
            }
        ]
    });



    //#region *** Дополнительные элементы интерфейса ***

    // Появление Прогрес-бара при (пере)загрузке
    webix.extend($$("NotesList"), webix.ProgressBar);
    $$("NotesList").showProgress({
        type: "top",
        delay:3000,
        hide:true
    });

    // Прогрес-бар (иконка) при обновлении компонента
    webix.extend($$("NoteTextArea"), webix.ProgressBar);

    // Контекстное меню для списка заметок
    webix.ui({ 
        view:"contextmenu",
        id:"cmenu",
        data: [
            "Переименовать",
            "Удалить",
            { $template:"Separator" },
            "История",
        ],

        on:{
            onItemClick: function(id) {
                var context = this.getContext();
                var list = context.obj;
                var itemId = context.id;
                var itemTitle = list.getItem(itemId).title;

                switch (id) {
                    case "Переименовать":
                        webix.prompt({
                            title:"Переименование заметки",
                            text:"Введите новое название заметки",
                            ok:"Переименовать",
                            cancel:"Отменить",
                            input:{
                              required:true,
                              placeholder:"Ваше название",
                              value: itemTitle
                            },
                            width: 350,
                        }).then(function(result){
                            renameNote(itemTitle, result, itemId);
                        });
                        break;
                    case "Удалить":

                        webix.confirm({
                            title:"Подтвердите действие",
                            ok:"Да", 
                            cancel:"Нет",
                            text:'Вы уверены что хотите удалить "' + itemTitle + '"?',
                        }).then(function(result){
                            deleteNote(itemTitle, itemId);
                        });
                        break;
                    case "История":
                        current_note_History = itemTitle;
                        loadNoteHistoryList(current_note_History)
                        $$('NotesHistoryWindow').show();
                        break;
                };
                
                //webix.message("List item: <i>"+itemId+"</i> <br/>Context menu item: <i>"+this.getItem(id).value+"</i>");
            }
        }
    });

    $$("cmenu").attachTo($$("NotesList"));

    // Меню с историей заметки
    webix.ui({
        view:"window",
        id:"NotesHistoryWindow",
        height:250,
        width:300,
        left:50, top:50,
        move:true,
        head:{
            view: 'toolbar',
            id: 'NotesHisoryWindowToolBar',
            cols: [
                {
                    width: 4,
                },
                {
                    view: 'label',
                    label: 'История заметки',
                },
                {
                    view: 'icon',
                    icon: 'wxi-close',
                    click: function() {
                        $$('NotesHistoryList').unselectAll();
                        $$('NotesHistoryWindow').hide();
                    }
                }
            ]
        },
        body:{
            view: 'list',
            id: 'NotesHistoryList',
            data: ' ', // НЕ УДАЛЯТЬ! Иначе не произайдет прогрузки

            select: true,
            drag: true,
            scroll: 'auto',
            template:"#title#",
        }
    });

    // Боковое меню со всеми кнопками
    webix.ui({
        view: "sidemenu",
        id: "menu",
        width: 200,
        position: "left",
        body:{
            view: "list",
            id: "Sidemenu_list",
            borderless: true,
            scroll: false,
            template: "<span class='webix_icon mdi mdi-#icon#'></span> #value#",
            data: [
                {id: 1, value: "Новая заметка", icon: "plus-circle"},
                {id: 2, value: "Обновить список", icon: "reload"},
                {id: 3, value: "Настройки", icon: "cog"},
            ],
            select: true,
            type: {
                height: 40
            },

            on: {
                onItemClick: function(id) {
                    switch (id) {
                        case '1':
                            webix.prompt({
                                title:"Создание заметки",
                                text:"Введите название новой заметки",
                                ok:"Создать",
                                cancel:"Отменить",
                                input:{
                                required:true,
                                placeholder:"Ваше название",
                                },
                                width: 350,
                            }).then(function(result) {
                                createNote(result);
                            });
                            break;

                        case '2':
                            loadNoteList();
                            break;

                        case '3':
                            $$('settingsMenu').show();
                            break;
                    };

                    $$("menu").hide();
                    $$('Sidemenu_list').unselectAll();
                }
            }
        }
    });

    //#endregion



    //#region *** События ***

    // Фильтрация списка заметок
    $$("NotesList_input").attachEvent("onTimedKeyPress", function() {
        var value = this.getValue().toLowerCase();
        $$("NotesList").filter(function(obj){
          return obj.title.toLowerCase().indexOf(value) !== -1;
        })
    });

    // Загрузка текста из заметки
    $$("NotesList").attachEvent("onSelectChange", function() {

        if($$("NotesList").getSelectedId()) {
            var itemId = $$("NotesList").getSelectedItem().title; // Изменить (выглядит ужасно)
            showNoteContent(itemId);
        } else {
            disableTextarea();
        }
        
    });

    // Загрузка текста из заметки
    $$("NotesList").attachEvent("onAfterAdd", function() {

        if(!$$("NotesList").getSelectedId()) {
            disableTextarea();
        }
        
    });

    // Загрузка текста из истории
    $$("NotesHistoryList").attachEvent("onSelectChange", function() {

        if($$("NotesHistoryList").getSelectedId()) {
            var itemId = $$("NotesHistoryList").getSelectedItem().title; // Изменить (выглядит ужасно)
            showHistoryContent(current_note_History, itemId);
        }
        
    });

    // Выбор автосейва (Включение-выключение)
    $$("autosave_checkbox").attachEvent("onChange", function(newValue, oldValue){
        autosave_set(newValue);
    });

    //#endregion


    
    //#region *** Функциии после инициализации ***

    loadNoteList();
    getEnvData();

    //#endregion

});