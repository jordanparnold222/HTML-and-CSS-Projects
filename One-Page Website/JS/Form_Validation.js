function formValidate()  {
    let x = document.forms["daForm"]["fname"].value;
    if (x == "")    {
        alert("WHERE IS YO PHONE NUMBER? YOU THINK THIS IS A JOKE?!");
        return false;
    }
}

function openForm()    {
    document.getElementById('myForm').style.display = block;
}