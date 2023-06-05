import { LightningElement, track } from 'lwc';

export default class SimpleSearch extends LightningElement {
  @track showList;
  @track searchTerm = '';
  @track searchResults = [
    { Id: '001', Name: 'Record 1' },
    { Id: '002', Name: 'Record 2' },
    { Id: '003', Name: 'Record 3' }
  ];

  get filteredResults() {
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      // Filter searchResults based on searchTerm
      return this.searchResults.filter(result => result.Name.includes(this.searchTerm));
    } else {
      this.showList = false;
      return [];
    }
  }

  handleSearch(event) {
    this.searchTerm = event.target.value;
    this.showList = true;
  }

  handleSelection(event) {
    this.showList = false;
    const selectedRecordId = event.target.dataset.recordId;
    this.searchTerm = event.target.innerText; // Replacing the input value with the selected record name
    
    console.log('** selectedRecordId:', selectedRecordId);
  }
}