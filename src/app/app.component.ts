import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { clone, parseInt, sample, sampleSize } from 'lodash-es';
import { Block } from './models/block';
import { Vec } from './models/vec';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  arena = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];

  marked = false;

  player = {
    block: null as Block | null,
    score: 0,
    nextBlock: null as Block | null
  };

  possibleBlocks = [{
    value: 1,
    color: `radial-gradient(circle at 24px 24px, blue, #000)`
  }, {
    value: 2,
    color: `radial-gradient(circle at 24px 24px, pink, #000)`
  }, {
    value: 4,
    color: `radial-gradient(circle at 24px 24px, maroon, #000)`
  }, {
    value: 8,
    color: `radial-gradient(circle at 24px 24px, orange, #000)`
  }] as Block[];

  selectedBlock: Block | null = null;

  ngOnInit() {
    this.populateBlocks();
  }

  populateBlocks() {
    this.player.block = this.player.nextBlock ? clone(this.player.nextBlock) : sample(this.possibleBlocks) as Block;
    this.player.nextBlock = sample(this.possibleBlocks) as Block;
  }

  onDragStart(block: Block | null) {
    this.selectedBlock = block;
  }

  onDragDropped(event: CdkDragEnd<any>, block: Block | null) {
    const cells = document.getElementById('arena')?.getElementsByClassName('cell');
    const x = event.dropPoint.x;
    const y = event.dropPoint.y;
    let found: HTMLDivElement | null = null;

    if (cells) {
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const rect = cell.getBoundingClientRect();
        const xRange = { x1: rect.x, x2: rect.x + rect.width };
        const yRange = { y1: rect.y, y2: rect.y + rect.height };
        if (y > yRange.y1 && y < yRange.y2 && x > xRange.x1 && x < xRange.x2) {
          found = cell as HTMLDivElement;
          break;
        }
      }

      if (found) {
        const vec = found.dataset['vec']?.split(',');
        if (vec) {
          console.log('x:' + vec[0] + ', y:' + vec[1]);
          this.onClickArena(parseInt(vec[1]));
        }
      }
    }
  }

  onClickArena(y: number) {
    if (!this.selectedBlock) {
      return;
    }

    const placedBlock = { x: 0, y: y } as Vec;
    for (let x = 7; x >= 0; x--) {
      if (x === 0 && this.arena[0][y] === 0) {
        placedBlock.x = 0;
        this.arena[placedBlock.x][y] = this.selectedBlock.value;
        break;
      }
      if (this.arena[x][y] !== 0) {
        placedBlock.x = x + 1;
        this.arena[placedBlock.x][y] = this.selectedBlock.value;
        break;
      }
    }
    this.player.block = null;
    setTimeout(() => {
      this.populateBlocks();
      this.selectedBlock = null;
      this.sweepArena(placedBlock);
    });
  }

  getColor(cell: number) {
    return this.possibleBlocks.find(c => c.value === cell)?.color;
  }

  checkCells = (left: Vec, right: Vec, top: Vec, current: Vec) => {
    const currentValue = this.arena.getByVec(current);
    if (this.arena.getByVec(left) === currentValue &&
      this.arena.getByVec(right) === currentValue &&
      this.arena.getByVec(top) === currentValue) {
      this.arena[top.y][top.x] = Math.pow(this.arena[current.y][current.x], 3);
      this.arena[current.y][current.x] = 0;
      this.arena[left.y][left.x] = 0;
      this.arena[right.y][right.x] = 0;
      this.marked = true;
      return this.arena.getByVec(current);
    }

    if (this.arena.getByVec(left) === currentValue &&
      this.arena.getByVec(right) === currentValue) {
      this.arena[current.y][current.x] = Math.pow(this.arena[current.y][current.x], 2);

      this.arena[left.y][left.x] = 0;
      this.arena[right.y][right.x] = 0;
      this.marked = true;
      return this.arena.getByVec(current);
    }

    if (this.arena.getByVec(left) === currentValue) {
      this.arena[current.y][current.x] = currentValue * 2;
      this.arena[left.y][left.x] = 0;
      this.marked = true;
      return this.arena.getByVec(current);
    }

    if (this.arena.getByVec(right) === currentValue) {
      this.arena[current.y][current.x] = currentValue * 2;
      this.arena[right.y][right.x] = 0;
      this.marked = true;
      return this.arena.getByVec(current);
    }

    if (this.arena.getByVec(top) === currentValue) {
      this.arena[top.y][top.x] = currentValue * 2;
      this.arena[current.y][current.x] = 0;
      this.marked = true;
      return this.arena.getByVec(current);
    }

    if (this.arena.getByVec(top) === 0) {
      this.arena[top.y][top.x] = this.arena[current.y][current.x];
      this.arena[current.y][current.x] = 0;
      this.marked = true;
      return this.arena.getByVec(current);
    }

    if (typeof this.arena.getByVec(top) === 'undefined') {
      if (this.arena.getByVec(current) === 0) {
        this.arena[current.y][current.x] = this.arena[current.y + 1][current.x];
        this.arena[current.y + 1][current.x] = 0;
        this.marked = true;
        return this.arena.getByVec(current);
      }
    }
    return;
  }

  sweepArena(placedBlock: Vec) {
    this.marked = false;
    const updateScore = (value?: number) => {
      if (value) {
        this.player.score += value;
      }
    };
    const sweep = () => {
      this.arena.forEach((row, y) => {
        row.forEach((cell, x) => {
          const leftCell = new Vec(y, x - 1);
          const rightCell = new Vec(y, x + 1);
          const topCell = new Vec(y - 1, x);
          try {
            updateScore(this.checkCells(leftCell, rightCell, topCell, new Vec(y, x)));
          } catch {
  
          }
        });
      });
      if (this.marked) {
        this.marked = false;
        setTimeout(() => {
          sweep();
        });
      }
    }

    sweep();
  }
}
