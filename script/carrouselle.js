document.addEventListener("DOMContentLoaded", function() {
    const items = document.querySelectorAll("#PROJECT .carrousel-items > div");
    let current = 0;

    function showItem(index) {
        items.forEach((item, i) => {
            item.style.display = i === index ? "block" : "none";
        });
    }
    showItem(current);

    document.getElementById("prevProject").onclick = function() {
        current = (current - 1 + items.length) % items.length;
        showItem(current);
    };
    document.getElementById("nextProject").onclick = function() {
        current = (current + 1) % items.length;
        showItem(current);
    };
});