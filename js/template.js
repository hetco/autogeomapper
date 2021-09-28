$('#templateselection').on('change',function(){
	let file = $('#templateselection').val();
	$('#downloadlink').attr('href','../template_files/'+file);
});