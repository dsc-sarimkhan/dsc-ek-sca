<script>
    $(document).ready(function(){
        $("#product-manuals-table").DataTable({
            "columns": [{
                    "data": "file_name"
                },
                {
                    "data": "action",
                    "bSortable": false
                }
            ]
        });
    });
</script>
<section class="product-manuals">
    <header class="order-history-list-header">
        <h2 class="dsc-page-title" style="text-align: center">Product Manuals</h2>
        <br>
    </header>
    <div id="product-details-information-tab-content-container-{{@index}}"
        class="product-details-information-tab-content-container" data-type="information-content-text">
        {{#if content.length}}
        <table id="product-manuals-table" class="table table-striped dsc-footer-table">
            <thead>
                <tr>
                    <th>File Name</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {{#each content}}
                <tr>
                    <td>{{file_name}}</td>
                    <td><a href='{{file_url}}' target='_blank'><button class=""><i class="fa fa-download"></i> Download
                                Attachment</button></a></td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        {{else}}
        No Data
        {{/if}}

        <br>

        <br>
    </div>
  
</section>