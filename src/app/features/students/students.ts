import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../core/services/student';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-students',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit{

  // Columnas de la tabla
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'image'];
  // Fuente de datos de la tabla
  dataSource = new MatTableDataSource<any>([]);
  // Número total de elementos
  totalElements: number = 0;
  // Número total de páginas
  totalPages: number = 0;
  // Página en la que se encuentra el usuario
  currentPage: number = 0;
  // Cantidad de elementos por página
  pageSize: number = 3;
  // Columna por la que se ordenarán los datos
  sortColumn: string = 'name';
  // Dirección de la ordenación
  sortDirection: string = 'asc';
  // Variable que almacena mensajes de error
  error: string | null = null;
  // Se inicializa automáticamente
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // Permite la ordenación de la tabla
  @ViewChild(MatSort) sort!: MatSort;

  students: any[] = []; // Almacena los alumnos del servicio

  constructor(private studentService: StudentService, private router: Router) {}

  // Método para cargar los datos iniciales
  ngOnInit() {
    this.fetchStudents(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection);
  }

  // Método para asociar el paginador y la ordenación a la tabla
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Suscripción al evento de cambio de ordenación
    this.sort.sortChange.subscribe((sort: Sort) => this.handleSortEvent(sort));
  }

  fetchStudents(page: number, size: number, sortColumn: string, sortDirection: string) {
    console.log(`Llamando al servicio con página: ${page}, tamaño: ${size}, orden: ${sortColumn} ${sortDirection}`);
    this.studentService.fetchStudents(page, size, sortColumn, sortDirection).subscribe({
      next: (res: any) => {
        console.log(`Datos recibidos: ${res.content.length} elementos, total páginas: ${res.totalPages}`);

        // Se actualiza la fuente de datos con los nuevos registros
        this.dataSource.data = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.currentPage = res.number;
        this.pageSize = res.pageSize;

        // Se actualiza el paginador y la vista
        setTimeout(() => {
          this.paginator.length = this.totalElements;
          this.paginator.pageIndex = this.currentPage;
          this.paginator.pageSize = this.pageSize;
        });
      },
      error: (err) => {
        console.error('Error al obtener los datos:', err);

        // Si el error es de autenticación, se redirige al usuario a la página de acceso denegado
        if (err.status === 403) {
          this.router.navigate(['/forbidden']);
        } else {
          this.error = ' Error al cargar los alumnos';
        }
      },
    });
  }

  // Método que controla la modificación de páginas y tamaño seleccionado
  handlePageEvent(event: PageEvent) {
    console.log(`Cambio de página detectado: Página ${event.pageIndex}, Tamaño: ${event.pageSize}`);
    this.fetchStudents(event.pageIndex, event.pageSize, this.sortColumn, this.sortDirection);
  }

  // Método que controla la modificación de columna y dirección seleccionado
  handleSortEvent(sort: Sort) {
    console.log(`Cambio de orden detectado: Ordenado por ${sort.active} (${sort.direction})`);

    this.sortColumn = sort.active;
    this.sortDirection = sort.direction || 'asc'; // Si no hay dirección, por defecto 'asc'

    this.fetchStudents(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection);
  }
}
