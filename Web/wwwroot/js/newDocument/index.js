import userStateManager from '../store.js';

$(document).ready(async () => {
    await userStateManager.init();

    const { hasAccessToRSF } = userStateManager.getUser();

    console.log(hasAccessToRSF);

    if (hasAccessToRSF) {
        $('#rsf-container').prepend(`
            <div class="form-group">
                <input type="checkbox" id="rsf" />
    
                <label for="rsf">RSF</label>
            </div>
        `);
    }
});

$(`#togglebox-setting`).on('click', (e) => {
	$("#box-setting-menu").removeClass('closed');
});

$(`#closeSideMenu`).on('click', (e) => {
	$("#box-setting-menu").addClass('closed');
});

$(`#input-img`).on('click', (e) => {
	if ($(`#input-file`).val() == "")
		$('#input-file').click();
});

$(`[data-action="open-pdf"]`).on('click', (e) => {
	$('#input-file').click();
});

$(document).ready(function () {
    //$('[data-toggle="tooltip"]').tooltip();
    $('#message').summernote({
        lang: 'fr-FR',
        height: 200,
        toolbar: [
        ]
    });
    $('#mailMessage').summernote({
        lang: 'fr-FR',
        height: 300,
        toolbar: [
            //['style', ['bold', 'italic', 'underline', 'clear']],
            //['font', ['strikethrough', 'superscript', 'subscript']],
            ////['fontsize', ['fontsize']],
            //['color', ['color']],
            //['para', ['ul', 'ol']],//, 'paragraph']],
            ////['height', ['height']]
        ]
    });
});

function resetMail() {
    $("#objectId").val("");
    $("#mailMessage").summernote('code', "");
}

$(`[data-action="resetMail"]`).on("click", (e) => {
    resetMail();
});
