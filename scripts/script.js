const books = [];
const RENDER_BOOKS = "render-books";
const NOTIF_TOAST = "when-save-event";
const ERROR_TOAST = 'error_toast'
const STORAGE_KEY = "BOOKSHELF";
const RENDER_SEARCH_BOOK = "render-search-book";

function generateId() {
    return +new Date();
}

function generateBookObj(id, title, author, year, isRead) {
    return {
        id,
        title,
        author,
        year,
        isRead,
    };
}

function loadDataFromStorage() {
    const serialized = localStorage.getItem(STORAGE_KEY);

    if (JSON.parse(serialized) !== null) {
        for (const book of JSON.parse(serialized))[books.push(book)];
    }
    document.dispatchEvent(new Event(RENDER_BOOKS));
}

function addBook() {
    const textTitle = document.getElementById("title").value;
    const textAuthor = document.getElementById("author").value;
    const numYear = parseInt(document.getElementById("year").value);
    const boolIsRead = document.getElementById("selesai-dibaca");
    const isChecked = boolIsRead.checked;

    const genId = generateId();
    const bookObj = generateBookObj(
        genId,
        textTitle,
        textAuthor,
        numYear,
        isChecked
    );

    books.push(bookObj);
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveToStorage();
}

function makeShelf(bookObj) {
    const {
        id,
        title,
        author,
        year,
        isRead
    } = bookObj;

    const textTitle = document.createElement("h2");
    textTitle.innerText = title;
    const textAuthor = document.createElement("h3");
    textAuthor.innerText = `by : ${author}`;
    const textYear = document.createElement("p");
    textYear.innerText = year;

    const textContainer = document.createElement("div");
    textContainer.classList.add("book-content");
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement("div");
    container.classList.add("container-book", "bordered");
    container.append(textContainer);
    container.setAttribute("id", `book-${id}`);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    const removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.innerHTML = "<a> Hapus </a><i class='fa-solid fa-trash'></i>";
    removeButton.addEventListener("click", () => {
        removeFromStorage(id);
    });
    if (isRead) {
        const unreadButton = document.createElement("button");
        unreadButton.classList.add("unread-button");
        unreadButton.innerHTML =
            "<a>Belum Dibaca</a><i class='fa-solid fa-retweet'></i>";
        unreadButton.addEventListener("click", () => {
            removeFromUnread(id);
        });

        buttonContainer.append(unreadButton, removeButton);
        container.append(buttonContainer);
    } else {
        const readButton = document.createElement("button");
        readButton.classList.add("read-button");
        readButton.innerHTML =
            "<a>Sudah Dibaca</a><i class='fa-solid fa-circle-check'></i>";
        readButton.addEventListener("click", () => {
            addToRead(id);
        });
        buttonContainer.append(readButton, removeButton);
        container.append(buttonContainer);
    }
    return container;
}

function addToRead(bookId) {
    const book = findBook(bookId);
    if (book == null) return;
    book.isRead = true;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveToStorage();
}

function removeFromUnread(bookId) {
    const book = findBook(bookId);
    if (book == null) return;
    book.isRead = false;
    document.dispatchEvent(new Event(RENDER_BOOKS));
    saveToStorage();
}

function removeFromStorage(bookId) {
    const book = findBookIndex(bookId);
    if (book == -1) return;
    books.splice(book, 1);
    document.dispatchEvent(new Event(RENDER_BOOKS));
    const msg =
        '<i class="fa-solid fa-circle-check"></i> Succesfully Removed from Storage !';
    const event = new CustomEvent(NOTIF_TOAST, {
        detail: msg
    });
    document.dispatchEvent(event);
    saveToStorage();
}

function isSupportStorage() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung web storage");
        return false;
    }
    return true;
}

function saveToStorage() {
    if (isSupportStorage()) {
        const stringObj = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, stringObj);
    }
}

function findBook(todoId) {
    return books.find((book) => book.id === todoId);
}

function findBookIndex(todoId) {
    return books.findIndex((book) => book.id === todoId);
}

const searchInput = document.getElementById("search");
const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    document.dispatchEvent(new Event(RENDER_SEARCH_BOOK));
});
searchInput.addEventListener("blur", (e) => {
    e.preventDefault();
    document.dispatchEvent(new Event(RENDER_SEARCH_BOOK));
});

function handleSearch() {
    const searchText = searchInput.value.toLowerCase();
    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchText)
    );
    console.log(filteredBooks);
}

function isBookExist(bookTitle) {
    const existingBookIndex = books.findIndex(book => book.title === bookTitle);
    return existingBookIndex !== -1;
}

document.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.getElementById("form-submit");

    submitForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const bookTitle = document.getElementById("title").value;

        if (isBookExist(bookTitle)) {
            const msg = '<i class="fa-solid fa-triangle-exclamation"></i> Title Already Exists!';
            const event = new CustomEvent(ERROR_TOAST, {
                detail: msg
            });
            document.dispatchEvent(event);
        } else {
            const msg = '<i class="fa-solid fa-circle-check"></i> Succesfully Submitted !';
            const event = new CustomEvent(NOTIF_TOAST, {
                detail: msg
            });
            document.dispatchEvent(event);
            addBook();
        }
    });
    if (isSupportStorage()) {
        loadDataFromStorage();
    }
});



document.addEventListener(RENDER_BOOKS, () => {
    const unreadBook = document.getElementById("unread-book");
    const finishedReading = document.getElementById("finished-reading");

    unreadBook.innerHTML = "";
    finishedReading.innerHTML = "";

    for (const book of books) {
        const bookElement = makeShelf(book);
        if (book.isRead) {
            finishedReading.appendChild(bookElement);
        } else {
            unreadBook.appendChild(bookElement);
        }
    }
});

document.addEventListener(RENDER_SEARCH_BOOK, () => {
    handleSearch();
});

function handleSearch() {
    const searchText = searchInput.value.toLowerCase();
    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchText)
    );
    renderSearchBooks(filteredBooks);
}

function renderSearchBooks(filteredBooks) {
    const unreadBook = document.getElementById("unread-book");
    const finishedReading = document.getElementById("finished-reading");

    unreadBook.innerHTML = "";
    finishedReading.innerHTML = "";

    for (const book of filteredBooks) {
        const bookElement = makeShelf(book);
        if (book.isRead) {
            finishedReading.appendChild(bookElement);
        } else {
            unreadBook.appendChild(bookElement);
        }
    }
}

let toastBox = document.querySelector("#toastBox");

document.addEventListener(NOTIF_TOAST, (event) => {
    let toast = document.createElement("div");
    toast.classList.add("toast", "success");
    toast.innerHTML = event.detail;
    toastBox.append(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
});
document.addEventListener(ERROR_TOAST, (event) => {
    let toast = document.createElement("div");
    toast.classList.add("toast", "error");
    toast.innerHTML = event.detail;
    toastBox.append(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
});
