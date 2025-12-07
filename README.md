# SEN12MS-CR-TS – Temporal Branched Model (Cloud Removal)

This repository contains my experiments with the **SEN12MS-CR-TS** framework for
cloud removal and SAR–optical fusion on the **SEN12MS-CR-TS** dataset.

I train the **temporal branched** generator (`resnet3d_9blocks_withoutBottleneck`)
starting from the released baseline ResNet weights and save qualitative results
and model checkpoints.

---

## 1. Environment

I use a Conda environment called `torchenv` with:

- Python 3.11
- PyTorch 2.6.0 + CUDA 12.4
- torchvision / torchaudio
- `dominate`, `visdom`
- `s2cloudless`, `sentinelhub` and their dependencies

Example:

```bash
conda create -n torchenv python=3.11
conda activate torchenv

# install torch with CUDA (adapt to your GPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# project requirements
pip install dominate visdom s2cloudless sentinelhub
```

Clone the project:

```bash
Copy code
git clone https://github.com/PatrickTUM/SEN12MS-CR-TS.git
cd SEN12MS-CR-TS
```

Copy your dataset and results folders next to this repo, e.g.:

```nginx
Copy code
New folder/
├── SEN12MS-CR-TS/          # cloned repo
├── Sentinel_Project/       # SEN12MS-CR-TS dataset root (ROIs1158/1868/1970/2017/…)
└── SEN12_results/          # where checkpoints + web images will be saved
```

## 2. Dataset
Sentinel_Project/ must follow the structure expected by the official data
loader:

```text
Copy code
Sentinel_Project/
├── ROIs1158/
├── ROIs1868/
├── ROIs1970/
│   ├── 20/
│   ├── 21/
│   │   ├── S1/
│   │   └── S2/
│   │       ├── 0/
│   │       ├── 1/
│   │       └── ...
└── ROIs2017/
```
You can obtain this layout by downloading the original archives and merging
their subfolders into a single directory.

## 3. Baseline ResNet checkpoint
Download the initial ResNet model (provided by the authors) into
SEN12MS-CR-TS/models/:

```bash
cd SEN12MS-CR-TS/models
wget https://syncandshare.lrz.de/dl/fiFfN2bj6DaFXfGEGAaAvdZE/baseline_resnet.pth
(or download manually and place as models/baseline_resnet.pth)
```
## 4. Training command
From inside SEN12MS-CR-TS/ with torchenv activated:

```bash
Copy code
python train.py --dataroot "C:\Users\ASUS\Desktop\Sentinel_Project" --dataset_mode sen12mscrts --name temporal_branched_ir_modified --sample_type cloudy_cloudfree --model temporal_branched --netG resnet3d_9blocks_withoutBottleneck --gpu_ids 0 --max_dataset_size 20 --checkpoints_dir "C:\Users\ASUS\Desktop\SEN12_results" --cloud_masks s2cloudless_mask --include_S1 --input_nc 15 --output_nc 13 --G_loss L1 --lambda_GAN 0.0 --display_id -1 --num_threads 0 --print_freq 1 --region all --alter_initial_model --initial_model_path "C:\Users\ASUS\Desktop\SEN12MS-CR-TS\models\baseline_resnet.pth" --update_html_freq 5 --display_freq 5 --save_latest_freq 20 --save_epoch_freq 1
Note:
On another machine, replace the absolute Windows paths (C:\Users\ASUS\Desktop\...)
with the correct locations of your dataset and results folders.
```
Key options:

sample_type cloudy_cloudfree – train on paired cloudy / cloud-free samples

include_S1 + input_nc 15 + output_nc 13 – use SAR + optical inputs,
predict 13-channel Sentinel-2 output

G_loss L1 & lambda_GAN 0.0 – pure L1 regression (no GAN loss)

max_dataset_size 20 – limit training to 20 samples (for quick testing)

checkpoints_dir SEN12_results – save models and web visualizations here

update_html_freq, display_freq – write PNGs/HTML every 5 iterations

save_latest_freq 20, save_epoch_freq 1 – checkpoint saving schedule

## 5. Outputs & result interpretation
After starting training, the script creates:

```text
SEN12_results/
└── temporal_branched_ir_modified/
    ├── web/
    │   ├── index.html
    │   └── images/
    │       ├── epoch001_it005_real_A_0_mask.png
    │       ├── epoch001_it005_real_A_0_S1.png
    │       ├── epoch001_it005_real_A_1_mask.png
    │       ├── epoch001_it005_fake_B.png
    │       ├── epoch001_it005_real_B.png
    │       └── ...
    └── (checkpoints, logs, etc.)
```
What are these images?
For each logged iteration (epochXXX_itYYY), multiple tiles are written:

real_A_* – input data to the model

*_S1 : Sentinel-1 SAR channels

*_mask : cloud masks (black = clear, white = cloud)

real_B_* – ground-truth cloud-free Sentinel-2 patch

fake_B – model prediction (reconstructed cloud-free image)

Sometimes multiple A_0, A_1, A_2 correspond to different time
steps or modalities.

These images allow you to visually compare:

cloudy input + SAR + cloud mask

generated cloud-free output (fake_B)

true cloud-free target (real_B)

You can open web/index.html in a browser to see the same images in a
simple gallery.

## 6. Notes
Training is GPU-intensive: I use an NVIDIA RTX 3060 Laptop GPU (6 GB).
<img width="1299" height="1007" alt="image" src="https://github.com/user-attachments/assets/35d223de-4f79-400a-84f1-4f7a2d0ef617" />

The first few iterations are slow because of data loading and model
initialization; later iterations become faster.

For full training on the entire dataset, increase max_dataset_size
and train for more epochs (niter, niter_decay).

## 7. Citation
If you use this code or the trained model, please also cite the original
SEN12MS-CR-TS work and dataset, as described in their repository.

## 8. Results

<p align="center"> <img width="1714" height="922" alt="result_image" src="https://github.com/user-attachments/assets/2a15ec26-24bc-4b15-94f2-4425c9f8cab3" /> </p>

The left tiles contain the input modalities (SAR + cloudy optical + mask),
while the right tiles show the predicted cloud-free reflectance compared to
the true cloud-free Sentinel-2 patch.
