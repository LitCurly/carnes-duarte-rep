import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CarneService } from '../../../services/carne.service'
import { Carne, Corte } from '../../../models/carne'

interface CorteExtendido extends Corte {
  carne: string
}

@Component({
  selector: 'app-gestionar-productos',
  templateUrl: './gestionar-productos.component.html',
  styleUrls: ['./gestionar-productos.component.css'],
})
export class GestionarProductosComponent implements OnInit {
  carnes: Carne[] = []
  cortes: CorteExtendido[] = []
  filteredCortes: CorteExtendido[] = []
  paginatedCortes: CorteExtendido[] = []
  searchQuery: string = ''
  selectedPreparation: string = ''
  selectedCarne: string = ''
  selectedCarneName: string = ''
  currentPage: number = 1
  itemsPerPage: number = 10
  isLoading = true
  showModal: boolean = false

  constructor(
    private carneService: CarneService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['searchQuery'] || ''
      this.selectedCarne = params['selectedCarne'] || ''
      this.selectedPreparation = params['selectedPreparation'] || ''
      this.currentPage = +params['page'] || 1
      this.loadCortes()
    })
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  loadCortes(): void {
    this.isLoading = true
    this.carneService.getAllCortes().subscribe((data: Carne[]) => {
      this.carnes = data
      this.cortes = data.flatMap((carne) => carne.cortes.map((corte) => ({ ...corte, carne: carne.tipo })))
      this.cortes.sort((a, b) => {
        const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return createdAtB - createdAtA // Ordenar por fecha de creación
      })
      this.filterCortes() // Llama a filterCortes aquí para aplicar los filtros
      this.isLoading = false
    })
  }

  filterCortes(): void {
    let filteredCortes = this.cortes

    if (this.selectedCarne && this.selectedCarne !== 'all') {
      filteredCortes = filteredCortes.filter((corte) => corte.carne === this.selectedCarne)
    }

    if (this.searchQuery) {
      filteredCortes = filteredCortes.filter((corte) =>
        corte.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }

    if (this.selectedPreparation === 'sin-preparaciones') {
      filteredCortes = filteredCortes.filter(
        (corte) => !corte.preparaciones || corte.preparaciones.length === 0
      )
    } else if (this.selectedPreparation && this.selectedPreparation !== 'all') {
      filteredCortes = filteredCortes.filter((corte) =>
        corte.preparaciones?.includes(this.selectedPreparation)
      )
    }

    this.filteredCortes = filteredCortes
    this.paginatedCortes = filteredCortes.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    )

    if (this.selectedCarne && this.selectedCarne !== 'all') {
      const carneSeleccionada = this.carnes.find((carne) => carne.tipo === this.selectedCarne)
      this.selectedCarneName = carneSeleccionada ? carneSeleccionada.tipo : ''
    } else {
      this.selectedCarneName = ''
    }
  }

  onSearch(): void {
    this.currentPage = 1
    this.filterCortes() // Realiza el filtrado solo al presionar "Buscar"
    this.updateQueryParams()
  }

  onCarneChange(): void {
    // Solo actualiza la selección, sin filtrar ni actualizar los parámetros de la URL
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.updateQueryParams()
      this.filterCortes()
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.updateQueryParams()
      this.filterCortes()
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCortes.length / this.itemsPerPage)
  }

  getPreparations(): string[] {
    const preparationsSet = new Set<string>()
    this.cortes.forEach((corte) => {
      if (corte.preparaciones) {
        corte.preparaciones.forEach((preparacion) => preparationsSet.add(preparacion))
      }
    })
    return Array.from(preparationsSet)
  }

  updateQueryParams(): void {
    const queryParams: any = {
      searchQuery: this.searchQuery,
      selectedPreparation: this.selectedPreparation,
      page: this.currentPage,
    }

    if (this.selectedCarne !== '') {
      queryParams.selectedCarne = this.selectedCarne
    } else {
      queryParams.selectedCarne = null
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    })
  }

  openModal(): void {
    this.showModal = true
  }

  closeModal(): void {
    this.showModal = false
  }

  eliminarCorte(corte: CorteExtendido): void {
    if (confirm(`¿Seguro que deseas eliminar el corte '${corte.nombre}'?`)) {
      this.carneService
        .eliminarCorte(corte, corte.carne)
        .then(() => {
          this.loadCortes() // Recargar la lista de cortes después de eliminar
        })
        .catch((error) => {
          console.error('Error al eliminar corte:', error)
        })
    }
  }

  editarCorte(corte: CorteExtendido): void {
    // Asegúrate de que el tipo y nombreCorte estén disponibles
    const tipo = corte.carne // Obtener el tipo de carne desde el objeto corte
    const nombreCorte = corte.nombre // Obtener el nombre del corte
    this.router.navigate([`/admin/home/gestionar-productos/${tipo}/${nombreCorte}/editar-productos`])
  }
}
